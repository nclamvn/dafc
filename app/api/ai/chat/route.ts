import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { queryData } from '@/lib/ai/tools/query-data';
import { calculateMetrics } from '@/lib/ai/tools/calculate-metrics';
import { generateChart } from '@/lib/ai/tools/generate-chart';
import { getAlerts } from '@/lib/ai/tools/get-alerts';
import { getSuggestions } from '@/lib/ai/tools/get-suggestions';
import { executeAction } from '@/lib/ai/tools/execute-action';

// System prompt for AI Assistant
const SYSTEM_PROMPT = `You are an intelligent AI assistant for the DAFC OTB (Open-To-Buy) Platform - a comprehensive retail merchandise planning system.

Your capabilities include:
1. **Data Analysis**: Query and analyze sales, inventory, OTB budgets, SKU performance, and KPIs
2. **Metrics Calculation**: Calculate key retail metrics like sell-through rate, gross margin, inventory turnover
3. **Visualization**: Generate charts and graphs for data visualization
4. **Alerts & Monitoring**: Track and report on business alerts and anomalies
5. **Smart Recommendations**: Provide AI-powered suggestions for buying, markdown, reorder decisions
6. **Action Execution**: Execute approved actions like approving proposals, updating budgets

Key Domain Knowledge:
- OTB (Open-To-Buy): Budget management for retail buying
- Sell-Through Rate: Percentage of inventory sold vs received
- Weeks of Supply (WOS): How many weeks current inventory will last
- Gross Margin: Revenue minus cost divided by revenue
- SKU: Stock Keeping Unit - individual product variant

Response Guidelines:
- Be concise and actionable in responses
- Use tables for comparing multiple data points
- Always provide context for metrics (good/warning/critical status)
- Offer follow-up suggestions after answering queries
- Support both English and Vietnamese - respond in the same language as the user

When using tools:
- Query data first before making calculations
- Show charts when discussing trends
- Check alerts for any critical issues
- Provide specific recommendations based on data

Current Context:
- User is a merchandise planner or buyer
- Focus on actionable insights for inventory and sales optimization
- Prioritize data accuracy over assumptions`;

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const { messages, conversationId, language = 'en' } = await request.json();

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.aIConversation.findUnique({
        where: { id: conversationId, userId },
      });
    }

    if (!conversation) {
      conversation = await prisma.aIConversation.create({
        data: {
          userId,
          title: messages[0]?.content?.slice(0, 100) || 'New Conversation',
          metadata: { language },
        },
      });
    }

    // Save user message
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage?.role === 'user') {
      await prisma.aIMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'USER',
          content: lastUserMessage.content,
        },
      });
    }

    // Prepare system prompt with language preference
    const systemPromptWithLang = language === 'vi'
      ? SYSTEM_PROMPT + '\n\nIMPORTANT: User prefers Vietnamese. Respond in Vietnamese unless they write in English.'
      : SYSTEM_PROMPT;

    // Define tools with execute functions (AI SDK v6 format)
    const tools = {
      query_data: tool({
        description: 'Query business data from the database including sales, inventory, OTB status, SKU performance, and more',
        inputSchema: z.object({
          query_type: z.enum([
            'sales_summary', 'inventory_status', 'otb_status', 'sku_performance',
            'brand_performance', 'category_performance', 'budget_status',
            'top_sellers', 'slow_movers', 'custom'
          ]).describe('Type of data query to execute'),
          filters: z.object({
            seasonId: z.string().optional(),
            brandId: z.string().optional(),
            categoryId: z.string().optional(),
            dateFrom: z.string().optional(),
            dateTo: z.string().optional(),
            limit: z.number().optional(),
          }).optional().describe('Optional filters for the query'),
          custom_query: z.string().optional().describe('Natural language query for custom searches'),
        }),
        execute: async (args: Record<string, unknown>) => {
          return await queryData(args, userId);
        },
      }),

      calculate_metrics: tool({
        description: 'Calculate KPIs and business metrics like sell-through rate, gross margin, inventory turnover, OTB utilization',
        inputSchema: z.object({
          metric: z.enum([
            'sell_through_rate', 'gross_margin', 'inventory_turnover',
            'otb_remaining', 'otb_utilization', 'weeks_of_supply',
            'stock_to_sales_ratio', 'markdown_rate', 'average_selling_price',
            'units_per_transaction'
          ]).describe('The metric to calculate'),
          context: z.object({
            seasonId: z.string().optional(),
            brandId: z.string().optional(),
            categoryId: z.string().optional(),
            period: z.string().optional(),
          }).optional().describe('Context for metric calculation'),
          compare_with: z.enum(['previous_period', 'previous_year', 'target', 'none'])
            .optional()
            .default('none')
            .describe('Compare with another period'),
        }),
        execute: async (args: Record<string, unknown>) => {
          return await calculateMetrics(args, userId);
        },
      }),

      generate_chart: tool({
        description: 'Generate chart data for visualization including sales trends, inventory levels, OTB utilization, and category mix',
        inputSchema: z.object({
          chart_type: z.enum(['line', 'bar', 'pie', 'area', 'combo']).describe('Type of chart to generate'),
          data_type: z.enum([
            'sales_trend', 'inventory_trend', 'otb_utilization',
            'category_mix', 'brand_comparison', 'sell_through_trend', 'margin_trend'
          ]).describe('Type of data to visualize'),
          time_range: z.object({
            periods: z.number().optional().default(6),
            unit: z.enum(['day', 'week', 'month']).optional().default('month'),
          }).optional().describe('Time range for trend data'),
          filters: z.object({
            seasonId: z.string().optional(),
            brandId: z.string().optional(),
            categoryId: z.string().optional(),
          }).optional(),
        }),
        execute: async (args: Record<string, unknown>) => {
          return await generateChart(args, userId);
        },
      }),

      get_alerts: tool({
        description: 'Fetch current business alerts and warnings including stockout risk, overstock, OTB overrun, and KPI threshold breaches',
        inputSchema: z.object({
          alert_type: z.enum([
            'all', 'stockout_risk', 'overstock_risk', 'otb_overrun',
            'approval_pending', 'kpi_threshold', 'margin_decline'
          ]).describe('Type of alerts to fetch'),
          severity: z.enum(['all', 'critical', 'warning', 'info']).optional().default('all'),
          limit: z.number().optional().default(10),
        }),
        execute: async (args: Record<string, unknown>) => {
          return await getAlerts(args, userId);
        },
      }),

      get_suggestions: tool({
        description: 'Get AI-powered recommendations for buying, markdown, reorder, transfer, pricing, or category optimization',
        inputSchema: z.object({
          suggestion_type: z.enum([
            'buy_recommendations', 'markdown_recommendations', 'reorder_recommendations',
            'transfer_recommendations', 'pricing_recommendations', 'category_optimization'
          ]).describe('Type of suggestions to generate'),
          context: z.object({
            seasonId: z.string().optional(),
            brandId: z.string().optional(),
            categoryId: z.string().optional(),
            budget: z.number().optional(),
          }).optional(),
          limit: z.number().optional().default(5),
        }),
        execute: async (args: Record<string, unknown>) => {
          return await getSuggestions(args, userId);
        },
      }),

      execute_action: tool({
        description: 'Execute business actions like approving proposals, updating budgets, or exporting data',
        inputSchema: z.object({
          action: z.enum([
            'approve_proposal', 'reject_proposal', 'submit_proposal',
            'approve_otb', 'reject_otb', 'update_budget',
            'update_sku_status', 'update_sku_quantity',
            'acknowledge_alert', 'dismiss_alert',
            'mark_notification_read', 'export_data', 'navigate', 'open_modal'
          ]).describe('Action to execute'),
          entity_type: z.string().describe('Type of entity being acted upon'),
          entity_id: z.string().optional().describe('ID of the entity'),
          parameters: z.record(z.unknown()).optional().describe('Additional parameters for the action'),
        }),
        execute: async (args: Record<string, unknown>) => {
          return await executeAction(args, userId);
        },
      }),
    };

    // Stream response with Vercel AI SDK
    const result = streamText({
      model: openai('gpt-4o'),
      system: systemPromptWithLang,
      messages,
      tools,
      onFinish: async ({ text, toolCalls, toolResults }) => {
        // Save assistant message
        await prisma.aIMessage.create({
          data: {
            conversationId: conversation!.id,
            role: 'ASSISTANT',
            content: text || '',
            toolCalls: toolCalls ? JSON.stringify(toolCalls) : undefined,
            toolResults: toolResults ? JSON.stringify(toolResults) : undefined,
          },
        });

        // Update conversation title if first message
        const messageCount = await prisma.aIMessage.count({
          where: { conversationId: conversation!.id },
        });
        if (messageCount <= 2 && lastUserMessage?.content) {
          await prisma.aIConversation.update({
            where: { id: conversation!.id },
            data: { title: lastUserMessage.content.slice(0, 100) },
          });
        }
      },
    });

    // Execute tools and stream results
    return result.toTextStreamResponse({
      headers: {
        'X-Conversation-Id': conversation.id,
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// GET endpoint to fetch conversation history
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      // Fetch specific conversation
      const conversation = await prisma.aIConversation.findUnique({
        where: { id: conversationId, userId: session.user.id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!conversation) {
        return new Response('Conversation not found', { status: 404 });
      }

      return Response.json(conversation);
    }

    // Fetch all conversations for user
    const conversations = await prisma.aIConversation.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    return Response.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// DELETE endpoint to delete conversation
export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return new Response('Conversation ID required', { status: 400 });
    }

    await prisma.aIConversation.delete({
      where: { id: conversationId, userId: session.user.id },
    });

    return new Response('Deleted', { status: 200 });
  } catch (error) {
    console.error('Delete conversation error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
