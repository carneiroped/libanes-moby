'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskForm } from '@/components/calendario-novo/TaskForm';
import { useTasks, TaskWithRelations, useUpdateTaskStatus, getTaskPriorityColor, getTaskPriorityLabel, getTaskStatusLabel, isTaskOverdue } from '@/hooks/useTasks';
import { Plus, Calendar, Flag, CheckCircle2, Circle, AlertCircle, Archive } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AdminDashboardPage } from '@/components/admin/loading/AdminPageLoader';

export default function TarefasPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Buscar tarefas baseado no status selecionado
  const statusFilter = selectedStatus === 'all' ? undefined : 
    selectedStatus === 'overdue' ? undefined : 
    selectedStatus === 'today' ? undefined :
    [selectedStatus];

  const { data: tasks = [], isLoading } = useTasks({
    status: statusFilter as any,
    overdue: selectedStatus === 'overdue',
    today: selectedStatus === 'today'
  });

  const updateTaskStatus = useUpdateTaskStatus();

  // Contadores de tarefas
  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => isTaskOverdue(t)).length,
    today: tasks.filter(t => t.due_date && format(new Date(t.due_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length
  };

  const handleTaskClick = (task: TaskWithRelations) => {
    setSelectedTask(task);
    setShowEditDialog(true);
  };

  const handleStatusChange = async (taskId: string, newStatus: 'completed' | 'cancelled') => {
    try {
      await updateTaskStatus.mutateAsync({ id: taskId, status: newStatus });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const filteredTasks = selectedStatus === 'all' ? tasks :
    selectedStatus === 'pending' ? tasks.filter(t => t.status === 'pending') :
    selectedStatus === 'in_progress' ? tasks.filter(t => t.status === 'in_progress') :
    selectedStatus === 'completed' ? tasks.filter(t => t.status === 'completed') :
    selectedStatus === 'overdue' ? tasks.filter(t => isTaskOverdue(t)) :
    selectedStatus === 'today' ? tasks.filter(t => t.due_date && format(new Date(t.due_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) :
    tasks;

  return (
    <AdminDashboardPage
      pageId="tasks"
      title="Tarefas"
      subtitle="Gerencie suas tarefas e atividades"
      isLoading={isLoading}
      error={null}
      isEmpty={!isLoading && tasks.length === 0}
      emptyStateConfig="NO_DATA"
      showMetrics={true}
      metricsCount={6}
      onRetry={() => window.location.reload()}
    >
      {/* Header actions */}
      <div className="flex justify-end items-center mb-6">
        <Button onClick={() => setShowNewTaskDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('all')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskCounts.all}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('pending')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{taskCounts.pending}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('in_progress')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{taskCounts.in_progress}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('completed')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{taskCounts.completed}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('overdue')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Atrasadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{taskCounts.overdue}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('today')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{taskCounts.today}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de filtro */}
      <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="in_progress">Em Progresso</TabsTrigger>
          <TabsTrigger value="completed">Concluídas</TabsTrigger>
          <TabsTrigger value="overdue">Atrasadas</TabsTrigger>
          <TabsTrigger value="today">Hoje</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className="mt-6">
          {/* Lista de tarefas */}
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Archive className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Nenhuma tarefa encontrada.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowNewTaskDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeira tarefa
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map(task => (
                <Card 
                  key={task.id} 
                  className={cn(
                    "hover:shadow-md transition-all cursor-pointer",
                    isTaskOverdue(task) && "border-red-500"
                  )}
                  onClick={() => handleTaskClick(task)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Checkbox/Status */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (task.status !== 'completed') {
                              handleStatusChange(task.id, 'completed');
                            }
                          }}
                          className="mt-1"
                        >
                          {task.status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                          )}
                        </button>

                        {/* Conteúdo */}
                        <div className="flex-1">
                          <h3 className={cn(
                            "font-medium",
                            task.status === 'completed' && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </h3>
                          
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 mt-2">
                            {/* Prioridade */}
                            <Badge variant="secondary" className={cn("text-xs", getTaskPriorityColor(task.priority as any))}>
                              <Flag className="h-3 w-3 mr-1" />
                              {getTaskPriorityLabel(task.priority as any)}
                            </Badge>

                            {/* Data */}
                            {task.due_date && (
                              <div className={cn(
                                "flex items-center gap-1 text-xs",
                                isTaskOverdue(task) ? "text-red-600" : "text-muted-foreground"
                              )}>
                                {isTaskOverdue(task) ? (
                                  <AlertCircle className="h-3 w-3" />
                                ) : (
                                  <Calendar className="h-3 w-3" />
                                )}
                                {format(new Date(task.due_date), "d 'de' MMM", { locale: ptBR })}
                              </div>
                            )}

                            {/* Lead */}
                            {task.lead && (
                              <div className="text-xs text-muted-foreground">
                                {task.lead.name}
                              </div>
                            )}

                            {/* Status */}
                            {task.status !== 'pending' && task.status !== 'completed' && (
                              <Badge variant="outline" className="text-xs">
                                {getTaskStatusLabel(task.status as any)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog para nova tarefa */}
      <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
          </DialogHeader>
          <TaskForm
            onSuccess={() => setShowNewTaskDialog(false)}
            onCancel={() => setShowNewTaskDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para editar tarefa */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
          </DialogHeader>
          <TaskForm
            task={selectedTask}
            onSuccess={() => {
              setShowEditDialog(false);
              setSelectedTask(null);
            }}
            onCancel={() => {
              setShowEditDialog(false);
              setSelectedTask(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </AdminDashboardPage>
  );
}