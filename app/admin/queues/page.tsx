'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { RefreshCw, Play, Pause, Trash2, AlertCircle, CheckCircle, Clock, XCircle, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface QueueMetrics {
  name: string
  waiting: number
  active: number
  completed: number
  failed: number
  delayed: number
  paused: number
}

interface Job {
  id: string
  name: string
  data: any
  opts: any
  progress: number
  delay: number
  timestamp: number
  attemptsMade: number
  processedOn?: number
  finishedOn?: number
  returnvalue?: any
  failedReason?: string
  stacktrace?: string[]
}

export default function QueuesPage() {
  const [metrics, setMetrics] = useState<QueueMetrics[]>([])
  const [selectedQueue, setSelectedQueue] = useState<string>('messages')
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Buscar métricas das filas
  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/queues')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      const data = await response.json()
      setMetrics(data.metrics)
    } catch (error) {
      console.error('Error fetching metrics:', error)
      toast.error('Erro ao buscar métricas')
    }
  }

  // Buscar jobs de uma fila específica
  const fetchJobs = async (queueName: string, status: string = 'waiting') => {
    try {
      const response = await fetch(`/api/admin/queues/${queueName}/jobs?status=${status}`)
      if (!response.ok) throw new Error('Failed to fetch jobs')
      const data = await response.json()
      setJobs(data.jobs)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast.error('Erro ao buscar jobs')
    }
  }

  // Ação em job específico
  const performJobAction = async (queueName: string, jobId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/queues/${queueName}/jobs/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      
      if (!response.ok) throw new Error(`Failed to ${action} job`)
      
      toast.success(`Job ${action} com sucesso`)
      fetchJobs(selectedQueue)
    } catch (error) {
      console.error(`Error performing ${action}:`, error)
      toast.error(`Erro ao ${action} job`)
    }
  }

  // Limpar jobs completados/falhos
  const cleanQueue = async (queueName: string, status: 'completed' | 'failed') => {
    try {
      const response = await fetch(`/api/admin/queues/${queueName}/clean`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, grace: 0 }),
      })
      
      if (!response.ok) throw new Error('Failed to clean queue')
      
      const data = await response.json()
      toast.success(`${data.removed} jobs removidos`)
      fetchMetrics()
    } catch (error) {
      console.error('Error cleaning queue:', error)
      toast.error('Erro ao limpar fila')
    }
  }

  // Criar job de teste
  const createTestJob = async (queueType: string) => {
    try {
      const response = await fetch('/api/admin/queues/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueType }),
      })
      
      if (!response.ok) throw new Error('Failed to create test job')
      
      const data = await response.json()
      toast.success(`Job de teste criado: ${data.jobId}`)
      fetchMetrics()
      if (selectedQueue === queueType) {
        fetchJobs(selectedQueue)
      }
    } catch (error) {
      console.error('Error creating test job:', error)
      toast.error('Erro ao criar job de teste')
    }
  }

  useEffect(() => {
    fetchMetrics()
    setLoading(false)

    // Auto refresh
    const interval = autoRefresh ? setInterval(() => {
      fetchMetrics()
      if (selectedQueue) {
        fetchJobs(selectedQueue)
      }
    }, 5000) : null

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, selectedQueue])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'active':
        return <Play className="h-4 w-4 text-blue-500" />
      case 'delayed':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'delayed':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Filas</h1>
          <p className="text-muted-foreground">
            Monitore e gerencie as filas de processamento
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchMetrics()
              if (selectedQueue) fetchJobs(selectedQueue)
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((queue) => (
          <Card key={queue.name} className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedQueue(queue.name)}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg capitalize">{queue.name}</CardTitle>
                  <CardDescription>Fila de {queue.name}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    createTestJob(queue.name)
                  }}
                  title={`Criar job de teste na fila ${queue.name}`}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Aguardando</span>
                  <Badge variant="secondary">{queue.waiting}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ativo</span>
                  <Badge className="bg-blue-100 text-blue-800">{queue.active}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completado</span>
                  <Badge className="bg-green-100 text-green-800">{queue.completed}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Falhou</span>
                  <Badge className="bg-red-100 text-red-800">{queue.failed}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detalhes da Fila Selecionada */}
      {selectedQueue && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="capitalize">Fila: {selectedQueue}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cleanQueue(selectedQueue, 'completed')}
                >
                  Limpar Completados
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cleanQueue(selectedQueue, 'failed')}
                >
                  Limpar Falhos
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="waiting" onValueChange={(value) => fetchJobs(selectedQueue, value)}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="waiting">Aguardando</TabsTrigger>
                <TabsTrigger value="active">Ativo</TabsTrigger>
                <TabsTrigger value="completed">Completado</TabsTrigger>
                <TabsTrigger value="failed">Falhou</TabsTrigger>
                <TabsTrigger value="delayed">Atrasado</TabsTrigger>
              </TabsList>

              <TabsContent value="waiting" className="mt-4">
                <ScrollArea className="h-[400px] w-full">
                  <div className="space-y-2">
                    {jobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        queueName={selectedQueue}
                        onAction={performJobAction}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="active" className="mt-4">
                <ScrollArea className="h-[400px] w-full">
                  <div className="space-y-2">
                    {jobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        queueName={selectedQueue}
                        onAction={performJobAction}
                        showProgress
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="completed" className="mt-4">
                <ScrollArea className="h-[400px] w-full">
                  <div className="space-y-2">
                    {jobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        queueName={selectedQueue}
                        onAction={performJobAction}
                        showResult
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="failed" className="mt-4">
                <ScrollArea className="h-[400px] w-full">
                  <div className="space-y-2">
                    {jobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        queueName={selectedQueue}
                        onAction={performJobAction}
                        showError
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="delayed" className="mt-4">
                <ScrollArea className="h-[400px] w-full">
                  <div className="space-y-2">
                    {jobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        queueName={selectedQueue}
                        onAction={performJobAction}
                        showDelay
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Componente de Card de Job
interface JobCardProps {
  job: Job
  queueName: string
  onAction: (queue: string, jobId: string, action: string) => void
  showProgress?: boolean
  showResult?: boolean
  showError?: boolean
  showDelay?: boolean
}

function JobCard({ job, queueName, onAction, showProgress, showResult, showError, showDelay }: JobCardProps) {
  return (
    <Card className="p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{job.id}</span>
            <Badge variant="outline">{job.name}</Badge>
            {job.attemptsMade > 0 && (
              <Badge variant="secondary">Tentativa {job.attemptsMade}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAction(queueName, job.id, 'retry')}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAction(queueName, job.id, 'remove')}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showProgress && job.progress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${job.progress}%` }}
            />
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(job.data, null, 2)}
          </pre>
        </div>

        {showResult && job.returnvalue && (
          <div className="mt-2 p-2 bg-green-50 rounded text-sm">
            <strong>Resultado:</strong>
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(job.returnvalue, null, 2)}
            </pre>
          </div>
        )}

        {showError && job.failedReason && (
          <div className="mt-2 p-2 bg-red-50 rounded text-sm">
            <strong>Erro:</strong> {job.failedReason}
            {job.stacktrace && (
              <details className="mt-2">
                <summary>Stack trace</summary>
                <pre className="text-xs">{job.stacktrace.join('\n')}</pre>
              </details>
            )}
          </div>
        )}

        {showDelay && job.delay > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            Agendado para: {new Date(job.timestamp + job.delay).toLocaleString()}
          </div>
        )}
      </div>
    </Card>
  )
}