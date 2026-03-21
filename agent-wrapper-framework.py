#!/usr/bin/env python3
"""
DevForge AI Agent Wrapper Framework for OpenClaw Integration

This framework provides a standardized wrapper for DevForge AI agents to integrate
with OpenClaw distributed processing environment via Tailscale networking.

Key Features:
- Standardized agent interface for OpenClaw compatibility
- Memory system integration (PARA, LCM, Gigabrain, OpenStinger)
- Cross-agent communication and coordination
- Health monitoring and error recovery
- Configuration management and deployment

Author: DevForge AI Agent Framework Team
Version: 1.0.0
Date: March 2026
"""

import asyncio
import json
import logging
import os
import sys
import time
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Callable, Union
from datetime import datetime, timedelta
from enum import Enum
import aiohttp
import websockets
import psutil
import socket
import threading
from concurrent.futures import ThreadPoolExecutor
import hashlib
import hmac

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('agent-wrapper.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('AgentWrapper')

class AgentStatus(Enum):
    """Agent operational status"""
    INITIALIZING = "initializing"
    REGISTERING = "registering"
    ACTIVE = "active"
    BUSY = "busy"
    ERROR = "error"
    MAINTENANCE = "maintenance"
    SHUTDOWN = "shutdown"

class MessageType(Enum):
    """Inter-agent communication message types"""
    TASK_REQUEST = "task_request"
    TASK_RESPONSE = "task_response"
    STATUS_UPDATE = "status_update"
    HEALTH_CHECK = "health_check"
    COORDINATION = "coordination"
    KNOWLEDGE_SHARE = "knowledge_share"
    ERROR_REPORT = "error_report"

@dataclass
class AgentConfig:
    """Agent configuration container"""
    agent_id: str
    agent_name: str
    agent_type: str
    disciplines: List[str]
    capabilities: List[str]
    memory_profile: str = "standard"
    max_concurrent_tasks: int = 3
    health_check_interval: int = 30
    coordination_enabled: bool = True
    openclaw_endpoint: str = "http://openclaw.local:8080"
    tailscale_network: str = "superpowers-net"
    api_key: Optional[str] = None
    secret_key: Optional[str] = None

@dataclass
class TaskContext:
    """Task execution context"""
    task_id: str
    description: str
    priority: str
    requester: str
    disciplines: List[str]
    deadline: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

@dataclass
class AgentMetrics:
    """Agent performance metrics"""
    tasks_completed: int = 0
    tasks_failed: int = 0
    average_response_time: float = 0.0
    uptime_seconds: int = 0
    memory_usage_mb: float = 0.0
    cpu_usage_percent: float = 0.0
    last_health_check: Optional[datetime] = None
    error_count: int = 0

class MemorySystemClient:
    """Client for interacting with DevForge AI memory systems"""

    def __init__(self, config: AgentConfig):
        self.config = config
        self.para_client = PARAClient()
        self.lcm_client = LCMClient()
        self.gigabrain_client = GigabrainClient()
        self.openstinger_client = OpenStingerClient()

    async def initialize(self):
        """Initialize memory system connections"""
        try:
            await self.para_client.connect()
            await self.lcm_client.connect()
            await self.gigabrain_client.connect()
            await self.openstinger_client.connect()
            logger.info(f"Memory systems initialized for agent {self.config.agent_id}")
        except Exception as e:
            logger.error(f"Failed to initialize memory systems: {e}")
            raise

    async def get_context(self, task: TaskContext) -> Dict[str, Any]:
        """Retrieve relevant context for task execution"""
        try:
            # Query PARA knowledge
            para_context = await self.para_client.query_context(
                query=task.description,
                disciplines=task.disciplines,
                depth=self.config.memory_profile
            )

            # Query shared resources
            shared_context = await self.para_client.query_shared_resources(
                query=task.description,
                categories=['framework', 'standards']
            )

            # Get session continuity from LCM
            session_context = await self.lcm_client.get_session_context()

            # Get intelligent recall from Gigabrain
            recall_context = await self.gigabrain_client.recall_relevant(
                query=task.description,
                context_type='task_execution'
            )

            # Get cross-session patterns from OpenStinger
            pattern_context = await self.openstinger_client.get_patterns(
                query=task.description
            )

            return {
                'para_knowledge': para_context,
                'shared_resources': shared_context,
                'session_context': session_context,
                'intelligent_recall': recall_context,
                'pattern_insights': pattern_context
            }

        except Exception as e:
            logger.error(f"Failed to retrieve context: {e}")
            return {}

    async def update_knowledge(self, task: TaskContext, results: Dict[str, Any]):
        """Update memory systems with task learnings"""
        try:
            # Update PARA with new knowledge
            await self.para_client.update_knowledge(
                discipline=task.disciplines[0],  # Primary discipline
                learnings=results.get('learnings', {})
            )

            # Update session continuity
            await self.lcm_client.update_session_context(
                task_id=task.task_id,
                context=results
            )

            # Update Gigabrain patterns
            await self.gigabrain_client.update_patterns(
                task_description=task.description,
                results=results
            )

            # Update OpenStinger graph
            await self.openstinger_client.update_graph(
                task_id=task.task_id,
                relationships=results.get('relationships', {})
            )

        except Exception as e:
            logger.error(f"Failed to update knowledge: {e}")

class PARAClient:
    """Client for PARA knowledge system"""

    def __init__(self):
        self.base_path = "docs_devforge_ai/para"
        self.connected = False

    async def connect(self):
        """Establish connection to PARA system"""
        # Verify PARA structure exists
        if os.path.exists(self.base_path):
            self.connected = True
            logger.info("Connected to PARA knowledge system")
        else:
            raise ConnectionError("PARA knowledge system not found")

    async def query_context(self, query: str, disciplines: List[str], depth: str) -> Dict[str, Any]:
        """Query PARA knowledge for relevant context"""
        context = {}

        for discipline in disciplines:
            discipline_path = f"{self.base_path}/pages/disciplines/{discipline}"

            if os.path.exists(discipline_path):
                # Query projects, areas, resources
                context[discipline] = {
                    'projects': await self._query_projects(discipline_path, query),
                    'areas': await self._query_areas(discipline_path, query),
                    'resources': await self._query_resources(discipline_path, query)
                }

        return context

    async def query_shared_resources(self, query: str, categories: List[str]) -> Dict[str, Any]:
        """Query shared resources across disciplines"""
        shared_path = "docs_shared"
        shared_context = {}

        for category in categories:
            category_path = f"{shared_path}/{category}"
            if os.path.exists(category_path):
                shared_context[category] = await self._scan_directory(category_path, query)

        return shared_context

    async def update_knowledge(self, discipline: str, learnings: Dict[str, Any]):
        """Update PARA knowledge with new learnings"""
        # This would update relevant PARA files with new knowledge
        # Implementation depends on specific PARA update mechanisms
        logger.info(f"Updating PARA knowledge for discipline {discipline}")

    async def _query_projects(self, discipline_path: str, query: str) -> Dict[str, Any]:
        """Query discipline projects"""
        projects_path = f"{discipline_path}/projects"
        return await self._scan_directory(projects_path, query)

    async def _query_areas(self, discipline_path: str, query: str) -> Dict[str, Any]:
        """Query discipline areas"""
        areas_path = f"{discipline_path}/areas"
        return await self._scan_directory(areas_path, query)

    async def _query_resources(self, discipline_path: str, query: str) -> Dict[str, Any]:
        """Query discipline resources"""
        resources_path = f"{discipline_path}/resources"
        return await self._scan_directory(resources_path, query)

    async def _scan_directory(self, path: str, query: str) -> Dict[str, Any]:
        """Scan directory for relevant content"""
        results = {}
        if not os.path.exists(path):
            return results

        for root, dirs, files in os.walk(path):
            for file in files:
                if file.endswith('.md'):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r') as f:
                            content = f.read()
                            if query.lower() in content.lower():
                                results[file] = {
                                    'path': file_path,
                                    'excerpt': content[:500] + "..." if len(content) > 500 else content
                                }
                    except Exception as e:
                        logger.warning(f"Failed to read {file_path}: {e}")

        return results

class LCMClient:
    """Client for LCM (Lossless Conversation Memory)"""

    def __init__(self):
        self.session_context = {}
        self.connected = False

    async def connect(self):
        """Connect to LCM system"""
        self.connected = True
        logger.info("Connected to LCM session memory")

    async def get_session_context(self) -> Dict[str, Any]:
        """Retrieve current session context"""
        return self.session_context.copy()

    async def update_session_context(self, task_id: str, context: Dict[str, Any]):
        """Update session context with task information"""
        self.session_context[task_id] = {
            'timestamp': datetime.now(),
            'context': context
        }

        # Maintain session context size limit
        if len(self.session_context) > 100:
            # Remove oldest entries
            oldest_key = min(self.session_context.keys(),
                           key=lambda k: self.session_context[k]['timestamp'])
            del self.session_context[oldest_key]

class GigabrainClient:
    """Client for Gigabrain intelligent recall system"""

    def __init__(self):
        self.patterns = {}
        self.connected = False

    async def connect(self):
        """Connect to Gigabrain system"""
        self.connected = True
        logger.info("Connected to Gigabrain recall system")

    async def recall_relevant(self, query: str, context_type: str) -> Dict[str, Any]:
        """Recall relevant information for query"""
        # Simple pattern matching - in real implementation this would be ML-based
        relevant_patterns = {}
        for pattern_key, pattern_data in self.patterns.items():
            if any(keyword in query.lower() for keyword in pattern_data.get('keywords', [])):
                relevant_patterns[pattern_key] = pattern_data

        return relevant_patterns

    async def update_patterns(self, task_description: str, results: Dict[str, Any]):
        """Update recall patterns based on task execution"""
        # Extract keywords and patterns from task
        keywords = task_description.lower().split()
        pattern_key = hashlib.md5(task_description.encode()).hexdigest()[:8]

        self.patterns[pattern_key] = {
            'keywords': keywords,
            'results': results,
            'last_updated': datetime.now(),
            'usage_count': self.patterns.get(pattern_key, {}).get('usage_count', 0) + 1
        }

class OpenStingerClient:
    """Client for OpenStinger cross-session graph recall"""

    def __init__(self):
        self.graph = {}
        self.connected = False

    async def connect(self):
        """Connect to OpenStinger system"""
        self.connected = True
        logger.info("Connected to OpenStinger graph recall")

    async def get_patterns(self, query: str) -> Dict[str, Any]:
        """Get cross-session patterns for query"""
        # Simple graph traversal - in real implementation this would be sophisticated
        related_patterns = {}
        for node_id, node_data in self.graph.items():
            if query.lower() in str(node_data).lower():
                related_patterns[node_id] = node_data

        return related_patterns

    async def update_graph(self, task_id: str, relationships: Dict[str, Any]):
        """Update knowledge graph with new relationships"""
        self.graph[task_id] = {
            'relationships': relationships,
            'timestamp': datetime.now(),
            'connected_nodes': list(relationships.keys())
        }

class OpenClawClient:
    """Client for OpenClaw distributed processing"""

    def __init__(self, config: AgentConfig):
        self.config = config
        self.session = None
        self.connected = False
        self.agent_registered = False

    async def connect(self):
        """Establish connection to OpenClaw"""
        try:
            self.session = aiohttp.ClientSession(
                headers={
                    'Authorization': f'Bearer {self.config.api_key}',
                    'User-Agent': f'DevForge-Agent-{self.config.agent_id}'
                }
            )

            # Test connection
            async with self.session.get(f"{self.config.openclaw_endpoint}/health") as response:
                if response.status == 200:
                    self.connected = True
                    logger.info(f"Connected to OpenClaw at {self.config.openclaw_endpoint}")
                else:
                    raise ConnectionError(f"OpenClaw health check failed: {response.status}")

        except Exception as e:
            logger.error(f"Failed to connect to OpenClaw: {e}")
            raise

    async def register_agent(self):
        """Register agent with OpenClaw"""
        if not self.connected:
            raise ConnectionError("Not connected to OpenClaw")

        try:
            registration_data = {
                'agent_id': self.config.agent_id,
                'agent_name': self.config.agent_name,
                'agent_type': self.config.agent_type,
                'disciplines': self.config.disciplines,
                'capabilities': self.config.capabilities,
                'max_concurrent_tasks': self.config.max_concurrent_tasks,
                'tailscale_address': self._get_tailscale_address(),
                'health_endpoint': f"http://{socket.gethostname()}:8081/health"
            }

            async with self.session.post(
                f"{self.config.openclaw_endpoint}/agents/register",
                json=registration_data
            ) as response:
                if response.status == 201:
                    self.agent_registered = True
                    logger.info(f"Agent {self.config.agent_id} registered with OpenClaw")
                else:
                    error_text = await response.text()
                    raise RuntimeError(f"Registration failed: {response.status} - {error_text}")

        except Exception as e:
            logger.error(f"Failed to register agent: {e}")
            raise

    async def update_status(self, status: AgentStatus, metadata: Dict[str, Any] = None):
        """Update agent status in OpenClaw"""
        if not self.agent_registered:
            return

        try:
            status_data = {
                'status': status.value,
                'timestamp': datetime.now().isoformat(),
                'metadata': metadata or {}
            }

            async with self.session.put(
                f"{self.config.openclaw_endpoint}/agents/{self.config.agent_id}/status",
                json=status_data
            ) as response:
                if response.status != 200:
                    logger.warning(f"Status update failed: {response.status}")

        except Exception as e:
            logger.error(f"Failed to update status: {e}")

    async def send_message(self, target_agent: str, message_type: MessageType, payload: Dict[str, Any]):
        """Send message to another agent via OpenClaw"""
        if not self.agent_registered:
            return

        try:
            message_data = {
                'from_agent': self.config.agent_id,
                'to_agent': target_agent,
                'message_type': message_type.value,
                'payload': payload,
                'timestamp': datetime.now().isoformat()
            }

            async with self.session.post(
                f"{self.config.openclaw_endpoint}/messages",
                json=message_data
            ) as response:
                if response.status != 202:
                    logger.warning(f"Message send failed: {response.status}")

        except Exception as e:
            logger.error(f"Failed to send message: {e}")

    async def receive_messages(self) -> List[Dict[str, Any]]:
        """Receive pending messages from OpenClaw"""
        if not self.agent_registered:
            return []

        try:
            async with self.session.get(
                f"{self.config.openclaw_endpoint}/agents/{self.config.agent_id}/messages"
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    return []

        except Exception as e:
            logger.error(f"Failed to receive messages: {e}")
            return []

    def _get_tailscale_address(self) -> str:
        """Get Tailscale IP address"""
        try:
            # This would need to be implemented based on actual Tailscale setup
            return socket.gethostbyname(socket.gethostname())
        except Exception:
            return "127.0.0.1"

    async def disconnect(self):
        """Disconnect from OpenClaw"""
        if self.session:
            await self.session.close()
        self.connected = False
        self.agent_registered = False
        logger.info("Disconnected from OpenClaw")

class DevForgeAgentWrapper:
    """Main agent wrapper class"""

    def __init__(self, config: AgentConfig):
        self.config = config
        self.status = AgentStatus.INITIALIZING
        self.metrics = AgentMetrics()
        self.memory_system = MemorySystemClient(config)
        self.openclaw_client = OpenClawClient(config)
        self.active_tasks = {}
        self.message_handlers = {}
        self.health_monitor_thread = None
        self.coordination_enabled = config.coordination_enabled

        # Register default message handlers
        self._register_default_handlers()

    async def initialize(self):
        """Initialize the agent wrapper"""
        try:
            logger.info(f"Initializing DevForge Agent Wrapper for {self.config.agent_id}")

            # Initialize memory systems
            await self.memory_system.initialize()

            # Connect to OpenClaw
            await self.openclaw_client.connect()

            # Register with OpenClaw
            await self.openclaw_client.register_agent()

            # Start health monitoring
            self._start_health_monitoring()

            # Update status
            self.status = AgentStatus.ACTIVE
            await self.openclaw_client.update_status(self.status)

            logger.info(f"Agent {self.config.agent_id} initialization complete")

        except Exception as e:
            logger.error(f"Agent initialization failed: {e}")
            self.status = AgentStatus.ERROR
            raise

    async def execute_task(self, task: TaskContext) -> Dict[str, Any]:
        """Execute a task with full context and coordination"""
        try:
            # Update status
            self.status = AgentStatus.BUSY
            await self.openclaw_client.update_status(self.status, {'task_id': task.task_id})

            # Track task
            self.active_tasks[task.task_id] = task
            task.started_at = datetime.now()

            # Get comprehensive context
            context = await self.memory_system.get_context(task)

            # Coordinate with other agents if needed
            if self.coordination_enabled:
                coordination_context = await self._coordinate_task(task, context)
                context.update(coordination_context)

            # Execute task (this would be implemented by specific agent)
            result = await self._execute_task_logic(task, context)

            # Update knowledge systems
            await self.memory_system.update_knowledge(task, result)

            # Complete task
            task.completed_at = datetime.now()
            del self.active_tasks[task.task_id]

            # Update metrics
            self.metrics.tasks_completed += 1
            execution_time = (task.completed_at - task.started_at).total_seconds()
            self.metrics.average_response_time = (
                (self.metrics.average_response_time * (self.metrics.tasks_completed - 1)) + execution_time
            ) / self.metrics.tasks_completed

            # Update status
            self.status = AgentStatus.ACTIVE
            await self.openclaw_client.update_status(self.status)

            return result

        except Exception as e:
            logger.error(f"Task execution failed: {e}")
            self.metrics.tasks_failed += 1
            self.status = AgentStatus.ERROR
            await self.openclaw_client.update_status(self.status, {'error': str(e)})

            # Report error
            await self.openclaw_client.send_message(
                target_agent="orion",  # Chief operations agent
                message_type=MessageType.ERROR_REPORT,
                payload={
                    'task_id': task.task_id,
                    'error': str(e),
                    'agent_id': self.config.agent_id
                }
            )

            raise

    async def _execute_task_logic(self, task: TaskContext, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the actual task logic - to be implemented by specific agents"""
        # This is a placeholder - specific agents would implement their own logic
        logger.info(f"Executing task: {task.description}")

        # Simulate task execution
        await asyncio.sleep(1)

        return {
            'status': 'completed',
            'result': f"Task {task.task_id} completed successfully",
            'learnings': {
                'patterns_identified': ['pattern1', 'pattern2'],
                'knowledge_gained': 'New insights from task execution'
            },
            'relationships': {
                'related_tasks': [],
                'prerequisites': []
            }
        }

    async def _coordinate_task(self, task: TaskContext, context: Dict[str, Any]) -> Dict[str, Any]:
        """Coordinate with other agents for task execution"""
        coordination_context = {}

        try:
            # Identify relevant agents based on disciplines and capabilities
            relevant_agents = await self._find_relevant_agents(task)

            # Send coordination requests
            coordination_requests = []
            for agent_id in relevant_agents:
                if agent_id != self.config.agent_id:  # Don't coordinate with self
                    coordination_requests.append(
                        self.openclaw_client.send_message(
                            target_agent=agent_id,
                            message_type=MessageType.COORDINATION,
                            payload={
                                'task_id': task.task_id,
                                'coordination_type': 'support_request',
                                'requirements': task.disciplines
                            }
                        )
                    )

            # Wait for coordination responses (with timeout)
            if coordination_requests:
                await asyncio.gather(*coordination_requests, return_exceptions=True)

            # Collect coordination responses
            messages = await self.openclaw_client.receive_messages()
            for message in messages:
                if (message.get('message_type') == MessageType.COORDINATION.value and
                    message.get('payload', {}).get('task_id') == task.task_id):
                    coordination_context[message['from_agent']] = message['payload']

        except Exception as e:
            logger.warning(f"Task coordination failed: {e}")

        return coordination_context

    async def _find_relevant_agents(self, task: TaskContext) -> List[str]:
        """Find agents relevant to the task"""
        # This would query OpenClaw for agents with matching disciplines/capabilities
        # For now, return some example agents
        relevant_agents = []

        if 'finance' in task.disciplines:
            relevant_agents.append('ledger')
        if 'strategy' in task.disciplines:
            relevant_agents.append('strategos')
        if 'engineering' in task.disciplines:
            relevant_agents.append('forge')

        return relevant_agents

    def _register_default_handlers(self):
        """Register default message handlers"""
        self.message_handlers = {
            MessageType.TASK_REQUEST: self._handle_task_request,
            MessageType.COORDINATION: self._handle_coordination,
            MessageType.HEALTH_CHECK: self._handle_health_check,
            MessageType.KNOWLEDGE_SHARE: self._handle_knowledge_share
        }

    async def _handle_task_request(self, message: Dict[str, Any]):
        """Handle incoming task requests"""
        # Implementation for handling task requests from other agents
        pass

    async def _handle_coordination(self, message: Dict[str, Any]):
        """Handle coordination messages"""
        # Implementation for handling coordination requests
        pass

    async def _handle_health_check(self, message: Dict[str, Any]):
        """Handle health check requests"""
        await self.openclaw_client.send_message(
            target_agent=message['from_agent'],
            message_type=MessageType.STATUS_UPDATE,
            payload={
                'status': self.status.value,
                'metrics': {
                    'tasks_completed': self.metrics.tasks_completed,
                    'uptime_seconds': self.metrics.uptime_seconds,
                    'error_count': self.metrics.error_count
                }
            }
        )

    async def _handle_knowledge_share(self, message: Dict[str, Any]):
        """Handle knowledge sharing requests"""
        # Implementation for sharing knowledge with other agents
        pass

    def _start_health_monitoring(self):
        """Start background health monitoring"""
        def health_monitor():
            while self.status != AgentStatus.SHUTDOWN:
                try:
                    # Update metrics
                    self.metrics.memory_usage_mb = psutil.Process().memory_info().rss / 1024 / 1024
                    self.metrics.cpu_usage_percent = psutil.Process().cpu_percent()
                    self.metrics.uptime_seconds = int(time.time() - psutil.Process().create_time())
                    self.metrics.last_health_check = datetime.now()

                    # Send health update to OpenClaw
                    asyncio.run(self.openclaw_client.update_status(
                        self.status,
                        {
                            'memory_mb': self.metrics.memory_usage_mb,
                            'cpu_percent': self.metrics.cpu_usage_percent,
                            'uptime_seconds': self.metrics.uptime_seconds
                        }
                    ))

                except Exception as e:
                    logger.error(f"Health monitoring error: {e}")
                    self.metrics.error_count += 1

                time.sleep(self.config.health_check_interval)

        self.health_monitor_thread = threading.Thread(target=health_monitor, daemon=True)
        self.health_monitor_thread.start()

    async def process_messages(self):
        """Process incoming messages from OpenClaw"""
        while self.status != AgentStatus.SHUTDOWN:
            try:
                messages = await self.openclaw_client.receive_messages()

                for message in messages:
                    message_type = MessageType(message.get('message_type'))
                    handler = self.message_handlers.get(message_type)

                    if handler:
                        await handler(message)
                    else:
                        logger.warning(f"No handler for message type: {message_type}")

                await asyncio.sleep(1)  # Polling interval

            except Exception as e:
                logger.error(f"Message processing error: {e}")
                await asyncio.sleep(5)  # Back off on errors

    async def shutdown(self):
        """Shutdown the agent wrapper"""
        logger.info(f"Shutting down agent {self.config.agent_id}")

        self.status = AgentStatus.SHUTDOWN

        # Update final status
        await self.openclaw_client.update_status(self.status)

        # Disconnect from OpenClaw
        await self.openclaw_client.disconnect()

        # Stop health monitoring
        if self.health_monitor_thread:
            self.health_monitor_thread.join(timeout=5)

        logger.info(f"Agent {self.config.agent_id} shutdown complete")

# Example usage and testing
async def main():
    """Example agent wrapper usage"""

    # Example agent configuration
    config = AgentConfig(
        agent_id="orion",
        agent_name="Orion Chief Operations",
        agent_type="executive",
        disciplines=["operations", "strategy", "finance"],
        capabilities=["task_coordination", "performance_monitoring", "decision_support"],
        memory_profile="enterprise",
        max_concurrent_tasks=5,
        api_key=os.getenv("OPENCLAW_API_KEY"),
        secret_key=os.getenv("OPENCLAW_SECRET_KEY")
    )

    # Create and initialize agent wrapper
    agent = DevForgeAgentWrapper(config)

    try:
        # Initialize
        await agent.initialize()

        # Start message processing in background
        message_task = asyncio.create_task(agent.process_messages())

        # Example task execution
        task = TaskContext(
            task_id="test-task-001",
            description="Optimize enterprise workflow automation",
            priority="high",
            requester="strategos",
            disciplines=["operations", "engineering"]
        )

        result = await agent.execute_task(task)
        logger.info(f"Task completed: {result}")

        # Keep running for a bit to process messages
        await asyncio.sleep(10)

    except Exception as e:
        logger.error(f"Agent execution failed: {e}")

    finally:
        # Shutdown
        await agent.shutdown()

if __name__ == "__main__":
    # Run example
    asyncio.run(main())