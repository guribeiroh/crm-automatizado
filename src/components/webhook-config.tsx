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
import { Separator } from '@/components/ui/separator'
import { 
  Webhook, 
  Settings, 
  Play, 
  Pause, 
  Copy, 
  Check,
  AlertCircle,
  Zap,
  Code,
  Key
} from 'lucide-react'

interface WebhookConfigProps {
  webhook?: {
    id: string
    name: string
    url: string
    events: string[]
    status: 'active' | 'inactive'
    headers?: Record<string, string>
    secret?: string
  }
  onSave: (webhook: any) => void
  onClose: () => void
}

export function WebhookConfig({ webhook, onSave, onClose }: WebhookConfigProps) {
  const [formData, setFormData] = useState({
    name: webhook?.name || '',
    url: webhook?.url || '',
    events: webhook?.events || [],
    status: webhook?.status || 'active',
    headers: webhook?.headers || {},
    secret: webhook?.secret || ''
  })

  const [copied, setCopied] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  const availableEvents = [
    'customer.created',
    'customer.updated',
    'customer.deleted',
    'lead.qualified',
    'deal.won',
    'deal.lost',
    'email.sent',
    'email.opened',
    'automation.triggered'
  ]

  const handleEventToggle = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }))
  }

  const handleHeaderChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      headers: { ...prev.headers, [key]: value }
    }))
  }

  const copyWebhookUrl = () => {
    const webhookUrl = `https://seu-dominio.com/webhook/${webhook?.id || 'novo'}`
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const testWebhook = async () => {
    try {
      // Simular teste de webhook
      setTestResult(null)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTestResult('success')
    } catch (error) {
      setTestResult('error')
    }
  }

  const handleSave = () => {
    onSave({
      ...webhook,
      ...formData,
      id: webhook?.id || Date.now().toString()
    })
    onClose()
  }

  return (
    <div className="space-y-6">
      {/* Configurações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="w-5 h-5" />
            Configurações do Webhook
          </CardTitle>
          <CardDescription>
            Configure os detalhes básicos do webhook
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Webhook</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Integração CRM"
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
            <Label htmlFor="url">URL de Destino</Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://api.exemplo.com/webhook"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secret">Chave Secreta (Opcional)</Label>
            <Input
              id="secret"
              type="password"
              value={formData.secret}
              onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
              placeholder="Chave para validação de segurança"
            />
          </div>
        </CardContent>
      </Card>

      {/* Eventos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Eventos Monitorados
          </CardTitle>
          <CardDescription>
            Selecione quais eventos devem disparar este webhook
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableEvents.map((event) => (
              <div key={event} className="flex items-center space-x-2">
                <Switch
                  id={event}
                  checked={formData.events.includes(event)}
                  onCheckedChange={() => handleEventToggle(event)}
                />
                <Label htmlFor={event} className="text-sm">
                  {event}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Headers Customizados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Headers HTTP
          </CardTitle>
          <CardDescription>
            Configure headers customizados para as requisições
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Authorization</Label>
              <Input
                value={formData.headers.Authorization || ''}
                onChange={(e) => handleHeaderChange('Authorization', e.target.value)}
                placeholder="Bearer token..."
              />
            </div>
            <div className="space-y-2">
              <Label>Content-Type</Label>
              <Select 
                value={formData.headers['Content-Type'] || 'application/json'}
                onValueChange={(value) => handleHeaderChange('Content-Type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="application/json">application/json</SelectItem>
                  <SelectItem value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</SelectItem>
                  <SelectItem value="text/plain">text/plain</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>X-API-Key</Label>
              <Input
                value={formData.headers['X-API-Key'] || ''}
                onChange={(e) => handleHeaderChange('X-API-Key', e.target.value)}
                placeholder="Sua API key..."
              />
            </div>
            <div className="space-y-2">
              <Label>User-Agent</Label>
              <Input
                value={formData.headers['User-Agent'] || 'CRM-Webhook/1.0'}
                onChange={(e) => handleHeaderChange('User-Agent', e.target.value)}
                placeholder="CRM-Webhook/1.0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* URL de Recebimento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            URL de Recebimento
          </CardTitle>
          <CardDescription>
            Use esta URL para receber webhooks de sistemas externos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={`https://seu-dominio.com/webhook/${webhook?.id || 'novo'}`}
              className="font-mono text-sm"
            />
            <Button variant="outline" size="sm" onClick={copyWebhookUrl}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Configure esta URL em sistemas externos para receber dados automaticamente
          </p>
        </CardContent>
      </Card>

      {/* Teste */}
      <Card>
        <CardHeader>
          <CardTitle>Testar Webhook</CardTitle>
          <CardDescription>
            Envie uma requisição de teste para validar a configuração
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button onClick={testWebhook} variant="outline">
              <Play className="w-4 h-4 mr-2" />
              Testar Conexão
            </Button>
            
            {testResult === 'success' && (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                <span className="text-sm">Teste realizado com sucesso!</span>
              </div>
            )}
            
            {testResult === 'error' && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Erro na conexão. Verifique a URL.</span>
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
        <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-purple-500">
          Salvar Webhook
        </Button>
      </div>
    </div>
  )
}