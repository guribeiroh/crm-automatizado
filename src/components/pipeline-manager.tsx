"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, GripVertical, Save, X } from 'lucide-react'
import { supabase, PipelineStage } from '@/lib/supabase'

interface PipelineManagerProps {
  onStagesChange?: (stages: PipelineStage[]) => void
}

const COLOR_OPTIONS = [
  { value: 'bg-red-500', label: 'Vermelho', preview: 'bg-red-500' },
  { value: 'bg-orange-500', label: 'Laranja', preview: 'bg-orange-500' },
  { value: 'bg-yellow-500', label: 'Amarelo', preview: 'bg-yellow-500' },
  { value: 'bg-green-500', label: 'Verde', preview: 'bg-green-500' },
  { value: 'bg-blue-500', label: 'Azul', preview: 'bg-blue-500' },
  { value: 'bg-indigo-500', label: 'Índigo', preview: 'bg-indigo-500' },
  { value: 'bg-purple-500', label: 'Roxo', preview: 'bg-purple-500' },
  { value: 'bg-pink-500', label: 'Rosa', preview: 'bg-pink-500' },
  { value: 'bg-gray-500', label: 'Cinza', preview: 'bg-gray-500' },
  { value: 'bg-cyan-500', label: 'Ciano', preview: 'bg-cyan-500' },
  { value: 'bg-teal-500', label: 'Verde-azulado', preview: 'bg-teal-500' },
  { value: 'bg-emerald-500', label: 'Esmeralda', preview: 'bg-emerald-500' }
]

const getBgColorFromColor = (color: string) => {
  const colorMap: { [key: string]: string } = {
    'bg-red-500': 'bg-red-50 dark:bg-red-900/20',
    'bg-orange-500': 'bg-orange-50 dark:bg-orange-900/20',
    'bg-yellow-500': 'bg-yellow-50 dark:bg-yellow-900/20',
    'bg-green-500': 'bg-green-50 dark:bg-green-900/20',
    'bg-blue-500': 'bg-blue-50 dark:bg-blue-900/20',
    'bg-indigo-500': 'bg-indigo-50 dark:bg-indigo-900/20',
    'bg-purple-500': 'bg-purple-50 dark:bg-purple-900/20',
    'bg-pink-500': 'bg-pink-50 dark:bg-pink-900/20',
    'bg-gray-500': 'bg-gray-50 dark:bg-gray-900/20',
    'bg-cyan-500': 'bg-cyan-50 dark:bg-cyan-900/20',
    'bg-teal-500': 'bg-teal-50 dark:bg-teal-900/20',
    'bg-emerald-500': 'bg-emerald-50 dark:bg-emerald-900/20'
  }
  return colorMap[color] || 'bg-gray-50 dark:bg-gray-900/20'
}

export function PipelineManager({ onStagesChange }: PipelineManagerProps) {
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [isAddingStage, setIsAddingStage] = useState(false)
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null)
  const [loading, setLoading] = useState(true)
  const [draggedStage, setDraggedStage] = useState<PipelineStage | null>(null)

  // Carregar estágios do Supabase
  const loadStages = async () => {
    try {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .order('position', { ascending: true })

      if (error) throw error
      setStages(data || [])
      onStagesChange?.(data || [])
    } catch (error) {
      console.error('Erro ao carregar estágios:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStages()
  }, [])

  // Criar novo estágio
  const handleCreateStage = async (formData: FormData) => {
    const name = formData.get('name') as string
    const color = formData.get('color') as string
    
    if (!name || !color) return

    try {
      const maxPosition = Math.max(...stages.map(s => s.position), 0)
      const bgColor = getBgColorFromColor(color)

      const { data, error } = await supabase
        .from('pipeline_stages')
        .insert([{
          name,
          color,
          bg_color: bgColor,
          position: maxPosition + 1
        }])
        .select()
        .single()

      if (error) throw error

      const newStages = [...stages, data].sort((a, b) => a.position - b.position)
      setStages(newStages)
      onStagesChange?.(newStages)
      setIsAddingStage(false)
    } catch (error) {
      console.error('Erro ao criar estágio:', error)
    }
  }

  // Atualizar estágio
  const handleUpdateStage = async (formData: FormData) => {
    if (!editingStage) return

    const name = formData.get('name') as string
    const color = formData.get('color') as string
    
    if (!name || !color) return

    try {
      const bgColor = getBgColorFromColor(color)

      const { data, error } = await supabase
        .from('pipeline_stages')
        .update({
          name,
          color,
          bg_color: bgColor,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingStage.id)
        .select()
        .single()

      if (error) throw error

      const newStages = stages.map(s => s.id === editingStage.id ? data : s)
      setStages(newStages)
      onStagesChange?.(newStages)
      setEditingStage(null)
    } catch (error) {
      console.error('Erro ao atualizar estágio:', error)
    }
  }

  // Excluir estágio
  const handleDeleteStage = async (stageId: string) => {
    try {
      console.log('Tentando deletar estágio:', stageId)
      
      const { error } = await supabase
        .from('pipeline_stages')
        .delete()
        .eq('id', stageId)

      if (error) {
        console.error('Erro do Supabase ao excluir estágio:', error)
        alert(`Erro ao excluir estágio: ${error.message}`)
        return
      }

      console.log('Estágio deletado com sucesso no Supabase')
      
      const newStages = stages.filter(s => s.id !== stageId)
      setStages(newStages)
      onStagesChange?.(newStages)
      
      alert('Estágio excluído com sucesso!')
    } catch (error) {
      console.error('Erro inesperado ao excluir estágio:', error)
      alert('Erro inesperado ao excluir estágio.')
    }
  }

  // Reordenar estágios
  const handleDragStart = (e: React.DragEvent, stage: PipelineStage) => {
    setDraggedStage(stage)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetStage: PipelineStage) => {
    e.preventDefault()
    if (!draggedStage || draggedStage.id === targetStage.id) {
      setDraggedStage(null)
      return
    }

    try {
      // Reordenar posições
      const newStages = [...stages]
      const draggedIndex = newStages.findIndex(s => s.id === draggedStage.id)
      const targetIndex = newStages.findIndex(s => s.id === targetStage.id)

      // Remove o item arrastado e insere na nova posição
      const [removed] = newStages.splice(draggedIndex, 1)
      newStages.splice(targetIndex, 0, removed)

      // Atualizar posições no banco
      const updates = newStages.map((stage, index) => ({
        id: stage.id,
        position: index + 1
      }))

      for (const update of updates) {
        await supabase
          .from('pipeline_stages')
          .update({ position: update.position })
          .eq('id', update.id)
      }

      // Atualizar estado local
      const updatedStages = newStages.map((stage, index) => ({
        ...stage,
        position: index + 1
      }))

      setStages(updatedStages)
      onStagesChange?.(updatedStages)
    } catch (error) {
      console.error('Erro ao reordenar estágios:', error)
    }

    setDraggedStage(null)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Pipeline</CardTitle>
          <CardDescription>Carregando estágios...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gerenciar Pipeline</CardTitle>
            <CardDescription>
              Configure os estágios da sua pipeline de vendas
            </CardDescription>
          </div>
          <Dialog open={isAddingStage} onOpenChange={setIsAddingStage}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Novo Estágio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Estágio</DialogTitle>
                <DialogDescription>
                  Configure um novo estágio para sua pipeline
                </DialogDescription>
              </DialogHeader>
              <form action={handleCreateStage} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Estágio</Label>
                  <Input id="name" name="name" placeholder="Ex: Qualificação" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Cor</Label>
                  <Select name="color" defaultValue="bg-blue-500">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_OPTIONS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full ${color.preview}`} />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsAddingStage(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Container com rolagem horizontal infinita */}
        <div className="relative">
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {stages.map((stage) => (
                <Card
                  key={stage.id}
                  className="cursor-move hover:shadow-md transition-all duration-200 flex-shrink-0 w-80"
                  draggable
                  onDragStart={(e) => handleDragStart(e, stage)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        <div className={`w-4 h-4 rounded-full ${stage.color}`} />
                        <div>
                          <h3 className="font-medium">{stage.name}</h3>
                          <p className="text-sm text-muted-foreground">Posição: {stage.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {stage.color.replace('bg-', '').replace('-500', '')}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingStage(stage)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (window.confirm(`Tem certeza que deseja excluir o estágio "${stage.name}"?\n\nEsta ação não pode ser desfeita e pode afetar clientes associados a este estágio.`)) {
                              handleDeleteStage(stage.id)
                            }
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Indicador de rolagem se houver muitos estágios */}
          {stages.length > 3 && (
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-l from-white via-white to-transparent dark:from-gray-950 dark:via-gray-950 dark:to-transparent w-8 h-full pointer-events-none" />
          )}
        </div>

        {/* Mensagem quando não há estágios */}
        {stages.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum estágio configurado ainda.</p>
            <p className="text-sm">Clique em "Novo Estágio" para começar.</p>
          </div>
        )}

        {/* Modal de Edição */}
        {editingStage && (
          <Dialog open={!!editingStage} onOpenChange={() => setEditingStage(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Estágio</DialogTitle>
                <DialogDescription>
                  Modifique as configurações do estágio
                </DialogDescription>
              </DialogHeader>
              <form action={handleUpdateStage} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome do Estágio</Label>
                  <Input 
                    id="edit-name" 
                    name="name" 
                    defaultValue={editingStage.name}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-color">Cor</Label>
                  <Select name="color" defaultValue={editingStage.color}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_OPTIONS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full ${color.preview}`} />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditingStage(null)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}