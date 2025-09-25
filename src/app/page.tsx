"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { WebhookConfig } from '@/components/webhook-config'
import { AutomationConfig } from '@/components/automation-config'
import { APISettings } from '@/components/api-settings'
import { PipelineManager } from '@/components/pipeline-manager'
import { 
  Users, 
  Plus, 
  Settings, 
  Webhook, 
  Activity, 
  TrendingUp, 
  Mail, 
  Phone, 
  Calendar,
  Edit,
  Trash2,
  Play,
  Pause,
  Zap,
  BarChart3,
  Filter,
  Search,
  Download,
  Upload,
  Key,
  GripVertical,
  ArrowRight,
  Layers
} from 'lucide-react'
import { supabase, PipelineStage, Customer as SupabaseCustomer } from '@/lib/supabase'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company: string
  stage_id: string
  value: number
  lastContact: string
  source: string
}

interface Automation {
  id: string
  name: string
  trigger: string
  action: string
  status: 'active' | 'inactive'
  executions: number
  lastRun: string
}

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  status: 'active' | 'inactive'
  lastTriggered: string
}

export default function CRMDashboard() {
  const [mounted, setMounted] = useState(false)
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: '1',
      name: 'Email de Boas-vindas',
      trigger: 'Novo cliente cadastrado',
      action: 'Enviar email template',
      status: 'active',
      executions: 45,
      lastRun: '2024-01-15 14:30'
    },
    {
      id: '2',
      name: 'Follow-up Automático',
      trigger: 'Cliente inativo por 30 dias',
      action: 'Criar tarefa para vendedor',
      status: 'active',
      executions: 12,
      lastRun: '2024-01-14 09:15'
    },
    {
      id: '3',
      name: 'Notificação Slack',
      trigger: 'Novo lead qualificado',
      action: 'Enviar mensagem no Slack',
      status: 'inactive',
      executions: 8,
      lastRun: '2024-01-10 16:45'
    }
  ])

  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: '1',
      name: 'Integração CRM',
      url: 'https://api.exemplo.com/webhook/crm',
      events: ['customer.created', 'customer.updated'],
      status: 'active',
      lastTriggered: '2024-01-15 15:20'
    },
    {
      id: '2',
      name: 'Sistema de Email',
      url: 'https://email.exemplo.com/webhook',
      events: ['email.sent', 'email.opened'],
      status: 'active',
      lastTriggered: '2024-01-15 12:10'
    }
  ])

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isAddingCustomer, setIsAddingCustomer] = useState(false)
  const [isConfiguring, setIsConfiguring] = useState<'webhook' | 'automation' | null>(null)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [draggedCustomer, setDraggedCustomer] = useState<Customer | null>(null)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

  useEffect(() => {
    setMounted(true)
    loadCustomers()
  }, [])

  // Carregar clientes do Supabase
  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          pipeline_stages (
            id,
            name,
            color,
            bg_color
          )
        `)

      if (error) throw error

      // Converter dados do Supabase para formato local
      const formattedCustomers: Customer[] = (data || []).map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        company: customer.company || '',
        stage_id: customer.stage_id,
        value: Number(customer.value) || 0,
        lastContact: customer.last_contact,
        source: customer.source || ''
      }))

      setCustomers(formattedCustomers)
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      // Dados de exemplo se não conseguir carregar do Supabase
      setCustomers([
        {
          id: '1',
          name: 'João Silva',
          email: 'joao@empresa.com',
          phone: '(11) 99999-9999',
          company: 'Tech Corp',
          stage_id: pipelineStages[2]?.id || 'customer',
          value: 15000,
          lastContact: '2024-01-15',
          source: 'Website'
        },
        {
          id: '2',
          name: 'Maria Santos',
          email: 'maria@startup.com',
          phone: '(11) 88888-8888',
          company: 'StartupXYZ',
          stage_id: pipelineStages[1]?.id || 'prospect',
          value: 8500,
          lastContact: '2024-01-14',
          source: 'LinkedIn'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || customer.stage_id === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalCustomers = customers.length
  const totalValue = customers.reduce((sum, customer) => sum + customer.value, 0)
  const activeAutomations = automations.filter(a => a.status === 'active').length
  const activeWebhooks = webhooks.filter(w => w.status === 'active').length

  const formatCurrency = (value: number) => {
    if (!mounted) return `R$ ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatNumber = (value: number) => {
    if (!mounted) return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  const getStageById = (stageId: string) => {
    return pipelineStages.find(stage => stage.id === stageId)
  }

  const handleAddCustomer = async (formData: FormData) => {
    const customerData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      company: formData.get('company') as string,
      stage_id: formData.get('stage_id') as string,
      value: Number(formData.get('value')),
      source: formData.get('source') as string
    }

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single()

      if (error) throw error

      const newCustomer: Customer = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        company: data.company || '',
        stage_id: data.stage_id,
        value: Number(data.value) || 0,
        lastContact: data.last_contact,
        source: data.source || ''
      }

      setCustomers([...customers, newCustomer])
      setIsAddingCustomer(false)
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error)
    }
  }

  const toggleAutomation = (id: string) => {
    setAutomations(automations.map(automation => 
      automation.id === id 
        ? { ...automation, status: automation.status === 'active' ? 'inactive' : 'active' }
        : automation
    ))
  }

  const toggleWebhook = (id: string) => {
    setWebhooks(webhooks.map(webhook => 
      webhook.id === id 
        ? { ...webhook, status: webhook.status === 'active' ? 'inactive' : 'active' }
        : webhook
    ))
  }

  const handleSaveWebhook = (webhookData: any) => {
    if (selectedItem) {
      setWebhooks(webhooks.map(w => w.id === selectedItem.id ? webhookData : w))
    } else {
      setWebhooks([...webhooks, webhookData])
    }
  }

  const handleSaveAutomation = (automationData: any) => {
    if (selectedItem) {
      setAutomations(automations.map(a => a.id === selectedItem.id ? automationData : a))
    } else {
      setAutomations([...automations, automationData])
    }
  }

  // Kanban Drag and Drop Functions
  const handleDragStart = (e: React.DragEvent, customer: Customer) => {
    setDraggedCustomer(customer)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, newStageId: string) => {
    e.preventDefault()
    if (draggedCustomer && draggedCustomer.stage_id !== newStageId) {
      try {
        // Atualizar no Supabase
        const { error } = await supabase
          .from('customers')
          .update({ 
            stage_id: newStageId,
            last_contact: new Date().toISOString().split('T')[0]
          })
          .eq('id', draggedCustomer.id)

        if (error) throw error

        // Atualizar estado local
        setCustomers(customers.map(customer => 
          customer.id === draggedCustomer.id 
            ? { ...customer, stage_id: newStageId, lastContact: new Date().toISOString().split('T')[0] }
            : customer
        ))
      } catch (error) {
        console.error('Erro ao mover cliente:', error)
      }
    }
    setDraggedCustomer(null)
  }

  const getCustomersByStage = (stageId: string) => {
    return filteredCustomers.filter(customer => customer.stage_id === stageId)
  }

  const handleStagesChange = (newStages: PipelineStage[]) => {
    setPipelineStages(newStages)
  }

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)

      if (error) throw error

      // Atualizar estado local
      setCustomers(customers.filter(customer => customer.id !== customerId))
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      alert('Erro ao excluir cliente. Tente novamente.')
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto p-4 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CRM Kanban
            </h1>
            <p className="text-muted-foreground">
              Gerencie clientes visualmente com automações e webhooks
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{totalCustomers}</div>
                <Users className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Valor Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
                <TrendingUp className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Automações Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{activeAutomations}</div>
                <Zap className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Webhooks Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{activeWebhooks}</div>
                <Webhook className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Modals */}
        {isConfiguring === 'webhook' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <WebhookConfig
                  webhook={selectedItem}
                  onSave={handleSaveWebhook}
                  onClose={() => {
                    setIsConfiguring(null)
                    setSelectedItem(null)
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {isConfiguring === 'automation' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <AutomationConfig
                  automation={selectedItem}
                  onSave={handleSaveAutomation}
                  onClose={() => {
                    setIsConfiguring(null)
                    setSelectedItem(null)
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="kanban" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="automations" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Automações
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Webhook className="w-4 h-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="apis" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              APIs
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Kanban Tab */}
          <TabsContent value="kanban" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Pipeline de Vendas</CardTitle>
                    <CardDescription>
                      Arraste os cartões entre as colunas para alterar o status
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={isAddingCustomer} onOpenChange={setIsAddingCustomer}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                          <Plus className="w-4 h-4 mr-2" />
                          Novo Cliente
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                          <DialogDescription>
                            Preencha os dados do novo cliente
                          </DialogDescription>
                        </DialogHeader>
                        <form action={handleAddCustomer} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Nome</Label>
                              <Input id="name" name="name" required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="company">Empresa</Label>
                              <Input id="company" name="company" required />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" required />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="phone">Telefone</Label>
                              <Input id="phone" name="phone" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="value">Valor (R$)</Label>
                              <Input id="value" name="value" type="number" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="stage_id">Estágio</Label>
                              <Select name="stage_id" defaultValue={pipelineStages[0]?.id}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {pipelineStages.map((stage) => (
                                    <SelectItem key={stage.id} value={stage.id}>
                                      <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                                        {stage.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="source">Origem</Label>
                              <Input id="source" name="source" placeholder="Website, LinkedIn..." />
                            </div>
                          </div>
                          <Button type="submit" className="w-full">
                            Adicionar Cliente
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar clientes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Kanban Board com rolagem horizontal infinita */}
                <div className="relative">
                  <div className="overflow-x-auto pb-4">
                    <div className="flex gap-6 min-w-max">
                      {pipelineStages.map((stage) => {
                        const stageCustomers = getCustomersByStage(stage.id)
                        const stageValue = stageCustomers.reduce((sum, customer) => sum + customer.value, 0)
                        
                        return (
                          <div
                            key={stage.id}
                            className={`${stage.bg_color} rounded-lg p-4 min-h-[600px] flex-shrink-0 w-80`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, stage.id)}
                          >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                            <h3 className="font-semibold text-sm">{stage.name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {stageCustomers.length}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mb-4 text-xs text-muted-foreground">
                          Total: {formatCurrency(stageValue)}
                        </div>

                        <div className="space-y-3">
                          {stageCustomers.map((customer) => (
                            <Card
                              key={customer.id}
                              className="cursor-move hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800 border-l-4"
                              style={{ borderLeftColor: stage.color.replace('bg-', '#') }}
                              draggable
                              onDragStart={(e) => handleDragStart(e, customer)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-sm mb-1">{customer.name}</h4>
                                    <p className="text-xs text-muted-foreground mb-1">{customer.company}</p>
                                  </div>
                                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                                </div>
                                
                                <div className="space-y-1 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    <span className="truncate">{customer.email}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    <span>{customer.phone}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between mt-3">
                                  <div className="text-sm font-medium text-green-600">
                                    {formatCurrency(customer.value)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {customer.source}
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between mt-2">
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {customer.lastContact}
                                  </div>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                      onClick={() => handleDeleteCustomer(customer.id)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  
                  {/* Indicador de rolagem se houver muitos estágios */}
                  {pipelineStages.length > 3 && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-l from-white via-white to-transparent dark:from-slate-100 dark:via-slate-100 dark:to-transparent w-8 h-full pointer-events-none" />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pipeline Management Tab */}
          <TabsContent value="pipeline" className="space-y-4">
            <PipelineManager onStagesChange={handleStagesChange} />
          </TabsContent>

          {/* Automations Tab */}
          <TabsContent value="automations" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Automações</CardTitle>
                    <CardDescription>
                      Configure automações baseadas em eventos
                    </CardDescription>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    onClick={() => {
                      setSelectedItem(null)
                      setIsConfiguring('automation')
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Automação
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {automations.map((automation) => (
                    <Card key={automation.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold">{automation.name}</h3>
                              <Badge className={`${automation.status === 'active' ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                                {automation.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
                              <div>
                                <span className="font-medium">Trigger:</span> {automation.trigger}
                              </div>
                              <div>
                                <span className="font-medium">Ação:</span> {automation.action}
                              </div>
                              <div>
                                <span className="font-medium">Execuções:</span> {automation.executions}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Última execução: {automation.lastRun}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={automation.status === 'active'}
                              onCheckedChange={() => toggleAutomation(automation.id)}
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedItem(automation)
                                setIsConfiguring('automation')
                              }}
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Webhooks</CardTitle>
                    <CardDescription>
                      Configure webhooks para integração com APIs externas
                    </CardDescription>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    onClick={() => {
                      setSelectedItem(null)
                      setIsConfiguring('webhook')
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Webhook
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {webhooks.map((webhook) => (
                    <Card key={webhook.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold">{webhook.name}</h3>
                              <Badge className={`${webhook.status === 'active' ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                                {webhook.status}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div>
                                <span className="font-medium">URL:</span> {webhook.url}
                              </div>
                              <div>
                                <span className="font-medium">Eventos:</span> {webhook.events.join(', ')}
                              </div>
                              <div className="text-xs">
                                Último disparo: {webhook.lastTriggered}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={webhook.status === 'active'}
                              onCheckedChange={() => toggleWebhook(webhook.id)}
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedItem(webhook)
                                setIsConfiguring('webhook')
                              }}
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* APIs Tab */}
          <TabsContent value="apis" className="space-y-4">
            <APISettings />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Estágio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pipelineStages.map((stage) => {
                      const count = customers.filter(c => c.stage_id === stage.id).length
                      const percentage = totalCustomers > 0 ? (count / totalCustomers) * 100 : 0
                      return (
                        <div key={stage.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                            <span>{stage.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{count}</span>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${stage.color}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <div className="flex-1 text-sm">
                          <div className="font-medium">Cliente movido para "Clientes"</div>
                          <div className="text-muted-foreground">João Silva - Tech Corp</div>
                        </div>
                        <div className="text-xs text-muted-foreground">2h atrás</div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <div className="flex-1 text-sm">
                          <div className="font-medium">Automação executada</div>
                          <div className="text-muted-foreground">Email de boas-vindas enviado</div>
                        </div>
                        <div className="text-xs text-muted-foreground">4h atrás</div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        <div className="flex-1 text-sm">
                          <div className="font-medium">Webhook disparado</div>
                          <div className="text-muted-foreground">Integração CRM atualizada</div>
                        </div>
                        <div className="text-xs text-muted-foreground">6h atrás</div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <div className="flex-1 text-sm">
                          <div className="font-medium">Novo lead adicionado</div>
                          <div className="text-muted-foreground">Ana Oliveira - Marketing Pro</div>
                        </div>
                        <div className="text-xs text-muted-foreground">1d atrás</div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}