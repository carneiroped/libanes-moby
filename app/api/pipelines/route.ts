import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ACCOUNT_ID = '6200796e-5629-4669-a4e1-3d8b027830fa';

export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { searchParams } = new URL(request.url);
    const pipelineId = searchParams.get('id');

    // Se tem ID, buscar pipeline específico
    if (pipelineId) {
      const { data: pipeline, error: pipelineError } = await supabase
        .from('pipelines')
        .select('*')
        .eq('id', pipelineId)
        .eq('account_id', ACCOUNT_ID)
        .single();

      if (pipelineError) {
        console.error('[API /pipelines] Error fetching pipeline:', pipelineError);
        return NextResponse.json({ error: pipelineError.message }, { status: 404 });
      }

      // Buscar stages deste pipeline
      const { data: stages, error: stagesError } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('pipeline_id', pipelineId)
        .order('order_index', { ascending: true });

      if (stagesError) {
        console.error('[API /pipelines] Error fetching stages:', stagesError);
      }

      return NextResponse.json({
        pipeline: {
          ...pipeline,
          stages: stages || []
        }
      });
    }

    // Buscar todos os pipelines
    const { data: pipelines, error: pipelinesError } = await supabase
      .from('pipelines')
      .select('*')
      .eq('account_id', ACCOUNT_ID)
      .eq('is_active', true)
      .order('is_default', { ascending: false });

    if (pipelinesError) {
      console.error('[API /pipelines] Error fetching pipelines:', pipelinesError);
      return NextResponse.json({ error: pipelinesError.message }, { status: 500 });
    }

    if (!pipelines || pipelines.length === 0) {
      return NextResponse.json({
        message: 'Nenhum pipeline encontrado',
        pipelines: []
      });
    }

    // Buscar stages para cada pipeline
    const pipelinesWithStages = await Promise.all(
      pipelines.map(async (pipeline) => {
        const { data: stages, error: stagesError } = await supabase
          .from('pipeline_stages')
          .select('*')
          .eq('pipeline_id', pipeline.id)
          .order('order_index', { ascending: true });

        if (stagesError) {
          console.error(`[API /pipelines] Error fetching stages for pipeline ${pipeline.id}:`, stagesError);
        }

        return {
          ...pipeline,
          stages: stages || [],
          leads_count: pipeline.total_leads || 0
        };
      })
    );

    return NextResponse.json({
      pipelines: pipelinesWithStages,
      total: pipelinesWithStages.length
    });
  } catch (error: any) {
    console.error('[API /pipelines] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const body = await request.json();
    const { name, description, is_default, stages } = body;

    // Criar pipeline
    const { data: pipeline, error: pipelineError } = await supabase
      .from('pipelines')
      .insert({
        account_id: ACCOUNT_ID,
        name,
        description,
        is_default: is_default || false,
        is_active: true
      })
      .select()
      .single();

    if (pipelineError) {
      console.error('[API /pipelines] Error creating pipeline:', pipelineError);
      return NextResponse.json({ error: pipelineError.message }, { status: 500 });
    }

    // Criar stages se fornecidos
    if (stages && stages.length > 0) {
      const stagesData = stages.map((stage: any, index: number) => ({
        pipeline_id: pipeline.id,
        name: stage.name,
        color: stage.color || '#3b82f6',
        order_index: stage.order || index + 1
      }));

      const { error: stagesError } = await supabase
        .from('pipeline_stages')
        .insert(stagesData);

      if (stagesError) {
        console.error('[API /pipelines] Error creating stages:', stagesError);
      }
    }

    return NextResponse.json({ pipeline });
  } catch (error: any) {
    console.error('[API /pipelines] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { searchParams } = new URL(request.url);
    const pipelineId = searchParams.get('id');

    if (!pipelineId) {
      return NextResponse.json({ error: 'Pipeline ID is required' }, { status: 400 });
    }

    const body = await request.json();

    const { data: pipeline, error: pipelineError } = await supabase
      .from('pipelines')
      .update(body)
      .eq('id', pipelineId)
      .eq('account_id', ACCOUNT_ID)
      .select()
      .single();

    if (pipelineError) {
      console.error('[API /pipelines] Error updating pipeline:', pipelineError);
      return NextResponse.json({ error: pipelineError.message }, { status: 500 });
    }

    return NextResponse.json({ pipeline });
  } catch (error: any) {
    console.error('[API /pipelines] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { searchParams } = new URL(request.url);
    const pipelineId = searchParams.get('id');

    if (!pipelineId) {
      return NextResponse.json({ error: 'Pipeline ID is required' }, { status: 400 });
    }

    const { error: pipelineError } = await supabase
      .from('pipelines')
      .delete()
      .eq('id', pipelineId)
      .eq('account_id', ACCOUNT_ID);

    if (pipelineError) {
      console.error('[API /pipelines] Error deleting pipeline:', pipelineError);
      return NextResponse.json({ error: pipelineError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Pipeline deleted successfully' });
  } catch (error: any) {
    console.error('[API /pipelines] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
