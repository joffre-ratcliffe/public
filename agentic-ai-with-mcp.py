import asyncio
from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.tools.mcp_tool import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import SseConnectionParams

async def main():
    # 1. Configure connection parameters to the remote or local SSE MCP Server
    # (For a local stdio process, use StdioConnectionParams instead)
    connection_params = SseConnectionParams(
        uri="http://localhost:8001/sse"
    )

    # 2. Wrap the connection into an ADK McpToolset 
    # This automatically queries 'list_tools' and adapts schemas to ADK format
    mcp_toolset = McpToolset(
        name="finance_mcp_services",
        connection_params=connection_params
    )

    # 3. Create your ADK Agent and hand it the toolset
    agent = LlmAgent(
        name="CurrencyAnalyst",
        model="gemini-2.5-flash", # Or your preferred model provider
        instructions=(
            "You are a helpful financial assistant. Use your available tools "
            "to check exchange rates and convert currency values accurately."
        ),
        tools=[mcp_toolset]
    )

    # 4. Initialize the ADK Runner to manage orchestration loops
    runner = Runner(agent=agent)

    # 5. Use an async context manager to gracefully open and close the stateful connection
    async with mcp_toolset:
        print("Successfully linked ADK client to MCP server tools.")
        
        user_prompt = "What is the exchange rate for 500 CAD to USD right now?"
        print(f"\nUser: {user_prompt}")
        
        # Execute the agent workflow loop
        response = await runner.run_async(user_prompt)
        
        print("\nAgent Response:")
        print(response.text)

if __name__ == "__main__":
    # Ensure standard async orchestration loop execution
    asyncio.run(main())
