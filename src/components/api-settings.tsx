"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Key, 
  Globe, 
  Shield, 
  Zap,
  Mail,
  MessageSquare,
  Database,
  Cloud,
  Settings,
  Check,
  AlertCircle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'

interface APIConfig {
  id: string
  name: string
  type: string
  baseUrl: string
  apiKey: string
  headers: Record<string, string>
  status: 'active' | 'inactive'
  lastUsed?: string
}

export function APISettings() {
  const [apis, setApis] = useState<APIConfig[]>([
    {
      id: '1',
      name: 'SendGrid Email',
      type: 'email',
      baseUrl: 'https://api.sendgrid.com/v3',
      apiKey: 'SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      headers: { 'Content-Type': 'application/json' },
      status: 'active',
      lastUsed: '2024-01-15 14:30'
    },
    {
      id: '2',
      name: 'Slack Notifications',
      type: 'messaging',
      baseUrl: 'https://hooks.slack.com/services',
      apiKey: 'xoxb-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      headers: { 'Content-Type': 'application/json' },
      status: 'active',
      lastUsed: '2024-01-15 12:15'
    }
  ])

  const [selectedApi, setSelectedApi] = useState<APIConfig | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error' | null>>({})

  const apiTypes = [
    { value: 'email', label: 'Email Service', icon: Mail, color: 'bg-blue-500' },
    { value: 'messaging', label: 'Messaging', icon: MessageSquare, color: 'bg-green-500' },
    { value: 'crm', label: 'CRM Integration', icon: Database, color: 'bg-purple-500' },
    { value: 'storage', label: 'Cloud Storage', icon: Cloud, color: 'bg-orange-500' },
    { value: 'webhook', label: 'Webhook Service', icon: Zap, color: 'bg-red-500' }
  ]

  const toggleApiKeyVisibility = (apiId: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [apiId]: !prev[apiId]
    }))
  }

  const testApiConnection = async (apiId: string) => {
    setTestResults(prev => ({ ...prev, [apiId]: null }))
    
    // Simular teste de conexão
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setTestResults(prev => ({ ...prev, [apiId]: 'success' }))
    } catch (error) {
      setTestResults(prev => ({ ...prev, [apiId]: 'error' }))
    }
  }

  const copyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey)
  }

  const handleSaveApi = (apiData: Partial<APIConfig>) => {
    if (selectedApi) {
      // Editar API existente
      setApis(prev => prev.map(api => 
        api.id === selectedApi.id ? { ...api, ...apiData } : api
      ))
    } else {
      // Adicionar nova API
      const newApi: APIConfig = {
        id: Date.now().toString(),
        name: apiData.name || '',
        type: apiData.type || '',
        baseUrl: apiData.baseUrl || '',
        apiKey: apiData.apiKey || '',
        headers: apiData.headers || {},
        status: 'active'
      }
      setApis(prev => [...prev, newApi])
    }
    setSelectedApi(null)
    setIsEditing(false)
  }

  const getApiTypeInfo = (type: string) => {
    return apiTypes.find(t => t.value === type) || apiTypes[0]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Configurações de API</h2>
          <p className="text-muted-foreground">
            Gerencie integrações com serviços externos
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedApi(null)
            setIsEditing(true)
          }}
          className="bg-gradient-to-r from-blue-500 to-purple-500"
        >
          <Key className="w-4 h-4 mr-2" />
          Nova API
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">APIs Ativas</p>
                    <p className="text-2xl font-bold">{apis.filter(api => api.status === 'active').length}</p>
                  </div>
                  <Globe className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de APIs</p>
                    <p className="text-2xl font-bold">{apis.length}</p>
                  </div>
                  <Key className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tipos</p>
                    <p className="text-2xl font-bold">{new Set(apis.map(api => api.type)).size}</p>
                  </div>
                  <Settings className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Segurança</p>
                    <p className="text-2xl font-bold text-green-600">OK</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* APIs List */}
          <Card>
            <CardHeader>
              <CardTitle>APIs Configuradas</CardTitle>
              <CardDescription>
                Gerencie todas as suas integrações de API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apis.map((api) => {
                  const typeInfo = getApiTypeInfo(api.type)
                  const TypeIcon = typeInfo.icon
                  
                  return (
                    <Card key={api.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg ${typeInfo.color} flex items-center justify-center text-white`}>
                              <TypeIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{api.name}</h3>
                              <p className="text-sm text-muted-foreground">{typeInfo.label}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={api.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                                  {api.status}
                                </Badge>
                                {api.lastUsed && (
                                  <span className="text-xs text-muted-foreground">
                                    Usado em {api.lastUsed}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => testApiConnection(api.id)}
                              disabled={testResults[api.id] === null}
                            >
                              {testResults[api.id] === null ? (
                                'Testando...'
                              ) : testResults[api.id] === 'success' ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : testResults[api.id] === 'error' ? (
                                <AlertCircle className="w-4 h-4 text-red-600" />
                              ) : (
                                'Testar'
                              )}
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedApi(api)
                                setIsEditing(true)
                              }}
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* API Details */}
                        <div className="mt-4 pt-4 border-t">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Base URL:</span>
                              <p className="text-muted-foreground font-mono">{api.baseUrl}</p>
                            </div>
                            <div>
                              <span className="font-medium">API Key:</span>
                              <div className="flex items-center gap-2">
                                <p className="text-muted-foreground font-mono">
                                  {showApiKey[api.id] ? api.apiKey : '••••••••••••••••••••••••••••••••'}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleApiKeyVisibility(api.id)}
                                >
                                  {showApiKey[api.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyApiKey(api.apiKey)}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Email</CardTitle>
              <CardDescription>
                Configure serviços de email como SendGrid, Mailgun, etc.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apis.filter(api => api.type === 'email').map(api => (
                  <div key={api.id} className="p-4 border rounded-lg">
                    <h3 className="font-semibold">{api.name}</h3>
                    <p className="text-sm text-muted-foreground">Status: {api.status}</p>
                  </div>
                ))}
                {apis.filter(api => api.type === 'email').length === 0 && (
                  <p className="text-muted-foreground">Nenhum serviço de email configurado.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messaging">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Messaging</CardTitle>
              <CardDescription>
                Configure serviços de mensagem como Slack, Discord, etc.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apis.filter(api => api.type === 'messaging').map(api => (
                  <div key={api.id} className="p-4 border rounded-lg">
                    <h3 className="font-semibold">{api.name}</h3>
                    <p className="text-sm text-muted-foreground">Status: {api.status}</p>
                  </div>
                ))}
                {apis.filter(api => api.type === 'messaging').length === 0 && (
                  <p className="text-muted-foreground">Nenhum serviço de messaging configurado.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Outras Integrações</CardTitle>
              <CardDescription>
                Configure outras integrações como CRM, Storage, etc.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apis.filter(api => !['email', 'messaging'].includes(api.type)).map(api => (
                  <div key={api.id} className="p-4 border rounded-lg">
                    <h3 className="font-semibold">{api.name}</h3>
                    <p className="text-sm text-muted-foreground">Tipo: {api.type} | Status: {api.status}</p>
                  </div>
                ))}
                {apis.filter(api => !['email', 'messaging'].includes(api.type)).length === 0 && (
                  <p className="text-muted-foreground">Nenhuma integração adicional configurada.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Edição/Criação */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {selectedApi ? 'Editar API' : 'Nova API'}
              </CardTitle>
              <CardDescription>
                Configure os detalhes da integração
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da API</Label>
                  <Input placeholder="Ex: SendGrid Email" />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {apiTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Base URL</Label>
                <Input placeholder="https://api.exemplo.com/v1" />
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                <Input type="password" placeholder="Sua chave de API" />
              </div>

              <div className="space-y-2">
                <Label>Headers Customizados (JSON)</Label>
                <Textarea 
                  placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => handleSaveApi({})}>
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}