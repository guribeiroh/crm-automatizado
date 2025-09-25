"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, 
  Plus, 
  Trash2, 
  Settings,
  Mail,
  MessageSquare,
  Bell,
  Calendar,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react'

interface AutomationStep {
  id: string
  type: 'trigger' | 'condition' | 'action'
  config: Record<string, any>
}

interface AutomationConfigProps {
  automation?: {
    id: string
    name: string
    description: string
    status: 'active' | 'inactive'
    steps: AutomationStep[]
  }
  onSave: (automation: any) => void
  onClose: () => void
}

export function AutomationConfig({ automation, onSave, onClose }: AutomationConfigProps) {
  const [formData, setFormData] = useState({
    name: automation?.name || '',
    description: automation?.description || '',
    status: automation?.status || 'active',
    steps: automation?.steps || []
  })

  const triggerTypes = [
    { value: 'customer_created', label: 'Novo cliente criado', icon: Users },
    { value: 'customer_updated', label: 'Cliente atualizado', icon: Users },
    { value: 'deal_won', label: 'Negócio ganho', icon: TrendingUp },
    { value: 'deal_lost', label: 'Negócio perdido', icon: TrendingUp },
    { value: 'email_opened', label: 'Email aberto', icon: Mail },
    { value: 'time_based', label: 'Baseado em tempo', icon: Clock },
    { value: 'inactivity', label: 'Inatividade do cliente', icon: Calendar }
  ]

  const actionTypes = [
    { value: 'send_email', label: 'Enviar email', icon: Mail },
    { value: 'send_sms', label: 'Enviar SMS', icon: MessageSquare },
    { value: 'create_task', label: 'Criar tarefa', icon: Calendar },
    { value: 'update_status', label: 'Atualizar status', icon: Users },
    { value: 'send_notification', label: 'Enviar notificação', icon: Bell },
    { value: 'webhook', label: 'Chamar webhook', icon: Zap }
  ]

  const addStep = (type: 'trigger' | 'condition' | 'action') => {
    const newStep: AutomationStep = {
      id: Date.now().toString(),
      type,
      config: {}
    }
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }))
  }

  const removeStep = (stepId: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }))
  }

  const updateStep = (stepId: string, config: Record<string, any>) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, config } : step
      )
    }))
  }

  const handleSave = () => {
    onSave({
      ...automation,
      ...formData,
      id: automation?.id || Date.now().toString()
    })
    onClose()
  }

  const renderStepConfig = (step: AutomationStep) => {
    switch (step.type) {
      case 'trigger':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Trigger</Label>
              <Select 
                value={step.config.type || ''} 
                onValueChange={(value) => updateStep(step.id, { ...step.config, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um trigger" />
                </SelectTrigger>
                <SelectContent>
                  {triggerTypes.map((trigger) => (
                    <SelectItem key={trigger.value} value={trigger.value}>
                      <div className="flex items-center gap-2">
                        <trigger.icon className="w-4 h-4" />
                        {trigger.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {step.config.type === 'time_based' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Intervalo</Label>
                  <Input
                    type="number"
                    value={step.config.interval || ''}
                    onChange={(e) => updateStep(step.id, { ...step.config, interval: e.target.value })}
                    placeholder="30"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unidade</Label>
                  <Select 
                    value={step.config.unit || 'days'} 
                    onValueChange={(value) => updateStep(step.id, { ...step.config, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutos</SelectItem>
                      <SelectItem value="hours">Horas</SelectItem>
                      <SelectItem value="days">Dias</SelectItem>
                      <SelectItem value="weeks">Semanas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        )

      case 'condition':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Campo</Label>
              <Select 
                value={step.config.field || ''} 
                onValueChange={(value) => updateStep(step.id, { ...step.config, field: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um campo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="status">Status do cliente</SelectItem>
                  <SelectItem value="value">Valor do negócio</SelectItem>
                  <SelectItem value="last_contact">Último contato</SelectItem>
                  <SelectItem value="source">Origem</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Operador</Label>
                <Select 
                  value={step.config.operator || ''} 
                  onValueChange={(value) => updateStep(step.id, { ...step.config, operator: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Igual a</SelectItem>
                    <SelectItem value="not_equals">Diferente de</SelectItem>
                    <SelectItem value="greater_than">Maior que</SelectItem>
                    <SelectItem value="less_than">Menor que</SelectItem>
                    <SelectItem value="contains">Contém</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input
                  value={step.config.value || ''}
                  onChange={(e) => updateStep(step.id, { ...step.config, value: e.target.value })}
                  placeholder="Valor de comparação"
                />
              </div>
            </div>
          </div>
        )

      case 'action':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Ação</Label>
              <Select 
                value={step.config.type || ''} 
                onValueChange={(value) => updateStep(step.id, { ...step.config, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma ação" />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      <div className="flex items-center gap-2">
                        <action.icon className="w-4 h-4" />
                        {action.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {step.config.type === 'send_email' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Template de Email</Label>
                  <Select 
                    value={step.config.template || ''} 
                    onValueChange={(value) => updateStep(step.id, { ...step.config, template: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="welcome">Boas-vindas</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="proposal">Proposta</SelectItem>
                      <SelectItem value="thank_you">Agradecimento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assunto</Label>
                  <Input
                    value={step.config.subject || ''}
                    onChange={(e) => updateStep(step.id, { ...step.config, subject: e.target.value })}
                    placeholder="Assunto do email"
                  />
                </div>
              </div>
            )}

            {step.config.type === 'webhook' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>URL do Webhook</Label>
                  <Input
                    value={step.config.url || ''}
                    onChange={(e) => updateStep(step.id, { ...step.config, url: e.target.value })}
                    placeholder="https://api.exemplo.com/webhook"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Método HTTP</Label>
                  <Select 
                    value={step.config.method || 'POST'} 
                    onValueChange={(value) => updateStep(step.id, { ...step.config, method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step.config.type === 'update_status' && (
              <div className="space-y-2">
                <Label>Novo Status</Label>
                <Select 
                  value={step.config.status || ''} 
                  onValueChange={(value) => updateStep(step.id, { ...step.config, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="customer">Cliente</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'trigger': return Zap
      case 'condition': return Settings
      case 'action': return Play
      default: return Settings
    }
  }

  const getStepColor = (type: string) => {
    switch (type) {
      case 'trigger': return 'bg-blue-500'
      case 'condition': return 'bg-yellow-500'
      case 'action': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Configurações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Configurações da Automação
          </CardTitle>
          <CardDescription>
            Configure os detalhes básicos da automação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Automação</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Email de Boas-vindas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'active' | 'inactive' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o que esta automação faz..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Fluxo da Automação */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo da Automação</CardTitle>
          <CardDescription>
            Configure o fluxo de trigger, condições e ações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Botões para adicionar steps */}
          <div className="flex gap-2 mb-6">
            <Button variant="outline" size="sm" onClick={() => addStep('trigger')}>
              <Zap className="w-4 h-4 mr-2" />
              Trigger
            </Button>
            <Button variant="outline" size="sm" onClick={() => addStep('condition')}>
              <Settings className="w-4 h-4 mr-2" />
              Condição
            </Button>
            <Button variant="outline" size="sm" onClick={() => addStep('action')}>
              <Plus className="w-4 h-4 mr-2" />
              Ação
            </Button>
          </div>

          {/* Lista de steps */}
          <div className="space-y-4">
            {formData.steps.map((step, index) => {
              const StepIcon = getStepIcon(step.type)
              return (
                <Card key={step.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${getStepColor(step.type)} flex items-center justify-center text-white`}>
                          <StepIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <CardTitle className="text-sm capitalize">{step.type}</CardTitle>
                          <CardDescription className="text-xs">
                            Passo {index + 1}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStep(step.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderStepConfig(step)}
                  </CardContent>
                </Card>
              )
            })}

            {formData.steps.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum passo configurado ainda.</p>
                <p className="text-sm">Adicione um trigger para começar.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSave} className="bg-gradient-to-r from-purple-500 to-pink-500">
          Salvar Automação
        </Button>
      </div>
    </div>
  )
}