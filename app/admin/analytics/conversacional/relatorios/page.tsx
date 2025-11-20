'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Download, 
  Calendar, 
  Clock, 
  FileText, 
  Mail, 
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { useAccount } from '@/hooks/useAccount'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DateRange } from 'react-day-picker'
import { toast } from 'sonner'

interface ScheduledReport {
  id: string
  frequency: 'daily' | 'weekly' | 'monthly'
  time: string
  dayOfWeek?: number
  dayOfMonth?: number
  reportConfig: {
    includeMetrics: boolean
    includeSentiment: boolean
    includeInsights: boolean
    includeRecommendations: boolean
    format: 'pdf' | 'excel' | 'json'
  }
  recipients: string[]
  isActive: boolean
  createdAt: string
}

interface ReportHistory {
  id: string
  reportType: string
  startDate: string
  endDate: string
  fileUrl: string
  generatedAt: string
  metadata: {
    hasMetrics: boolean
    hasSentiment: boolean
    hasInsights: boolean
    recommendationsCount: number
  }
}

export default function ConversationalReports() {
  const { account } = useAccount()
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([])
  const [reportHistory, setReportHistory] = useState<ReportHistory[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date()
  })
  
  // Report configuration
  const [reportConfig, setReportConfig] = useState({
    includeMetrics: true,
    includeSentiment: true,
    includeInsights: true,
    includeRecommendations: true,
    format: 'pdf' as 'pdf' | 'excel' | 'json'
  })

  // Schedule configuration
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [scheduleConfig, setScheduleConfig] = useState({
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    time: '09:00',
    dayOfWeek: 1, // Monday
    dayOfMonth: 1,
    recipients: [''] as string[]
  })

  const fetchScheduledReports = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/analytics/reports/scheduled?accountId=${account?.id}`)
      if (response.ok) {
        const data = await response.json()
        setScheduledReports(data)
      }
    } catch (error) {
      console.error('Error fetching scheduled reports:', error)
    }
  }, [account?.id])

  const fetchReportHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/analytics/reports/history?accountId=${account?.id}`)
      if (response.ok) {
        const data = await response.json()
        setReportHistory(data)
      }
    } catch (error) {
      console.error('Error fetching report history:', error)
    }
  }, [account?.id])

  useEffect(() => {
    if (account?.id) {
      fetchScheduledReports()
      fetchReportHistory()
    }
  }, [account?.id, fetchScheduledReports, fetchReportHistory])

  const generateReport = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Selecione um período para o relatório')
      return
    }

    setGenerating(true)
    try {
      const response = await fetch('/api/admin/analytics/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account?.id,
          type: 'custom',
          startDate: dateRange.from,
          endDate: dateRange.to,
          ...reportConfig
        })
      })

      if (response.ok) {
        const { fileUrl } = await response.json()
        window.open(fileUrl, '_blank')
        toast.success('Relatório gerado com sucesso!')
        fetchReportHistory() // Refresh history
      } else {
        toast.error('Erro ao gerar relatório')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Erro ao gerar relatório')
    } finally {
      setGenerating(false)
    }
  }

  const scheduleReport = async () => {
    const validRecipients = scheduleConfig.recipients.filter(r => r.trim())
    if (validRecipients.length === 0) {
      toast.error('Adicione pelo menos um destinatário')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/analytics/reports/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account?.id,
          frequency: scheduleConfig.frequency,
          time: scheduleConfig.time,
          dayOfWeek: scheduleConfig.frequency === 'weekly' ? scheduleConfig.dayOfWeek : undefined,
          dayOfMonth: scheduleConfig.frequency === 'monthly' ? scheduleConfig.dayOfMonth : undefined,
          reportConfig,
          recipients: validRecipients
        })
      })

      if (response.ok) {
        toast.success('Relatório agendado com sucesso!')
        setShowScheduleForm(false)
        fetchScheduledReports()
        // Reset form
        setScheduleConfig({
          frequency: 'weekly',
          time: '09:00',
          dayOfWeek: 1,
          dayOfMonth: 1,
          recipients: ['']
        })
      } else {
        toast.error('Erro ao agendar relatório')
      }
    } catch (error) {
      console.error('Error scheduling report:', error)
      toast.error('Erro ao agendar relatório')
    } finally {
      setLoading(false)
    }
  }

  const deleteScheduledReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/admin/analytics/reports/scheduled/${reportId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Agendamento removido')
        fetchScheduledReports()
      }
    } catch (error) {
      console.error('Error deleting scheduled report:', error)
      toast.error('Erro ao remover agendamento')
    }
  }

  const addRecipient = () => {
    setScheduleConfig({
      ...scheduleConfig,
      recipients: [...scheduleConfig.recipients, '']
    })
  }

  const updateRecipient = (index: number, value: string) => {
    const newRecipients = [...scheduleConfig.recipients]
    newRecipients[index] = value
    setScheduleConfig({
      ...scheduleConfig,
      recipients: newRecipients
    })
  }

  const removeRecipient = (index: number) => {
    setScheduleConfig({
      ...scheduleConfig,
      recipients: scheduleConfig.recipients.filter((_, i) => i !== index)
    })
  }

  const getDayName = (day: number) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    return days[day]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios de Analytics</h1>
        <p className="text-muted-foreground">
          Gere e agende relatórios detalhados sobre suas conversas
        </p>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">Gerar Relatório</TabsTrigger>
          <TabsTrigger value="scheduled">Relatórios Agendados</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurar Relatório</CardTitle>
              <CardDescription>
                Escolha o período e os dados que deseja incluir no relatório
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Range */}
              <div className="space-y-2">
                <Label>Período</Label>
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={setDateRange}
                />
              </div>

              {/* Content Options */}
              <div className="space-y-4">
                <Label>Conteúdo do Relatório</Label>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="metrics">Métricas de Conversação</Label>
                    <p className="text-sm text-muted-foreground">
                      Tempo de resposta, taxa de resolução, abandono, etc.
                    </p>
                  </div>
                  <Switch
                    id="metrics"
                    checked={reportConfig.includeMetrics}
                    onCheckedChange={(checked) => 
                      setReportConfig({ ...reportConfig, includeMetrics: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sentiment">Análise de Sentimento</Label>
                    <p className="text-sm text-muted-foreground">
                      Tendências emocionais e satisfação do cliente
                    </p>
                  </div>
                  <Switch
                    id="sentiment"
                    checked={reportConfig.includeSentiment}
                    onCheckedChange={(checked) => 
                      setReportConfig({ ...reportConfig, includeSentiment: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="insights">Insights e Padrões</Label>
                    <p className="text-sm text-muted-foreground">
                      Tópicos principais, objeções comuns, perguntas frequentes
                    </p>
                  </div>
                  <Switch
                    id="insights"
                    checked={reportConfig.includeInsights}
                    onCheckedChange={(checked) => 
                      setReportConfig({ ...reportConfig, includeInsights: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="recommendations">Recomendações</Label>
                    <p className="text-sm text-muted-foreground">
                      Sugestões de melhorias baseadas nos dados
                    </p>
                  </div>
                  <Switch
                    id="recommendations"
                    checked={reportConfig.includeRecommendations}
                    onCheckedChange={(checked) => 
                      setReportConfig({ ...reportConfig, includeRecommendations: checked })
                    }
                  />
                </div>
              </div>

              {/* Format */}
              <div className="space-y-2">
                <Label>Formato</Label>
                <Select 
                  value={reportConfig.format} 
                  onValueChange={(value: 'pdf' | 'excel' | 'json') => 
                    setReportConfig({ ...reportConfig, format: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        PDF
                      </div>
                    </SelectItem>
                    <SelectItem value="excel">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Excel
                      </div>
                    </SelectItem>
                    <SelectItem value="json">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        JSON
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button 
                  onClick={generateReport}
                  disabled={generating || !dateRange?.from || !dateRange?.to}
                  className="flex-1"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Gerar Relatório
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowScheduleForm(true)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Form */}
          {showScheduleForm && (
            <Card>
              <CardHeader>
                <CardTitle>Agendar Relatório</CardTitle>
                <CardDescription>
                  Configure o envio automático de relatórios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Frequência</Label>
                    <Select 
                      value={scheduleConfig.frequency}
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                        setScheduleConfig({ ...scheduleConfig, frequency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Horário</Label>
                    <Input
                      type="time"
                      value={scheduleConfig.time}
                      onChange={(e) => 
                        setScheduleConfig({ ...scheduleConfig, time: e.target.value })
                      }
                    />
                  </div>

                  {scheduleConfig.frequency === 'weekly' && (
                    <div className="space-y-2">
                      <Label>Dia da Semana</Label>
                      <Select
                        value={scheduleConfig.dayOfWeek.toString()}
                        onValueChange={(value) => 
                          setScheduleConfig({ ...scheduleConfig, dayOfWeek: parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4, 5, 6].map(day => (
                            <SelectItem key={day} value={day.toString()}>
                              {getDayName(day)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {scheduleConfig.frequency === 'monthly' && (
                    <div className="space-y-2">
                      <Label>Dia do Mês</Label>
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        value={scheduleConfig.dayOfMonth}
                        onChange={(e) => 
                          setScheduleConfig({ 
                            ...scheduleConfig, 
                            dayOfMonth: parseInt(e.target.value) || 1 
                          })
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Destinatários</Label>
                  <div className="space-y-2">
                    {scheduleConfig.recipients.map((recipient, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          type="email"
                          placeholder="email@exemplo.com"
                          value={recipient}
                          onChange={(e) => updateRecipient(idx, e.target.value)}
                        />
                        {scheduleConfig.recipients.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeRecipient(idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addRecipient}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Destinatário
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={scheduleReport}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Agendando...
                      </>
                    ) : (
                      'Confirmar Agendamento'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowScheduleForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Agendados</CardTitle>
              <CardDescription>
                Gerencie seus relatórios automáticos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scheduledReports.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhum relatório agendado
                </p>
              ) : (
                <div className="space-y-4">
                  {scheduledReports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={report.isActive ? 'default' : 'secondary'}>
                            {report.isActive ? (
                              <><CheckCircle className="h-3 w-3 mr-1" /> Ativo</>
                            ) : (
                              <><XCircle className="h-3 w-3 mr-1" /> Inativo</>
                            )}
                          </Badge>
                          <span className="font-medium capitalize">
                            {report.frequency === 'daily' && 'Diário'}
                            {report.frequency === 'weekly' && 'Semanal'}
                            {report.frequency === 'monthly' && 'Mensal'}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteScheduledReport(report.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {report.time}
                          {report.frequency === 'weekly' && ` - ${getDayName(report.dayOfWeek || 0)}`}
                          {report.frequency === 'monthly' && ` - Dia ${report.dayOfMonth}`}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {report.recipients.length} destinatário(s)
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          Formato: {report.reportConfig.format.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Relatórios</CardTitle>
              <CardDescription>
                Relatórios gerados anteriormente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportHistory.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhum relatório gerado ainda
                </p>
              ) : (
                <div className="space-y-4">
                  {reportHistory.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {format(new Date(report.startDate), 'dd/MM/yyyy', { locale: ptBR })} - 
                              {format(new Date(report.endDate), 'dd/MM/yyyy', { locale: ptBR })}
                            </span>
                            <Badge variant="outline" className="capitalize">
                              {report.reportType}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              Gerado em {format(new Date(report.generatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </span>
                            <div className="flex items-center gap-2">
                              {report.metadata.hasMetrics && <Badge variant="secondary">Métricas</Badge>}
                              {report.metadata.hasSentiment && <Badge variant="secondary">Sentimento</Badge>}
                              {report.metadata.hasInsights && <Badge variant="secondary">Insights</Badge>}
                              {report.metadata.recommendationsCount > 0 && (
                                <Badge variant="secondary">
                                  {report.metadata.recommendationsCount} Recomendações
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(report.fileUrl, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Baixar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}