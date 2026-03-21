#!/usr/bin/env python3
"""
OpenClaw Agent Registration and Discovery System

This module handles agent registration with OpenClaw distributed processing
environment and provides service discovery capabilities for inter-agent
communication within the DevForge AI ecosystem.

Key Features:
- Agent registration with OpenClaw
- Service discovery and health monitoring
- Dynamic agent coordination
- Load balancing and failover
- Network topology awareness via Tailscale

Author: DevForge AI OpenClaw Integration Team
Version: 1.0.0
Date: March 2026
"""

import asyncio
import json
import logging
import os
import socket
import time
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Set
from datetime import datetime, timedelta
from enum import Enum
import aiohttp
import psutil
from concurrent.futures import ThreadPoolExecutor
import hashlib

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('openclaw-registration.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('OpenClawRegistration')

class AgentHealth(Enum):
    """Agent health status"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"

class ServiceType(Enum):
    """Types of services agents can provide"""
    TASK_EXECUTION = "task_execution"
    KNOWLEDGE_QUERY = "knowledge_query"
    COORDINATION = "coordination"
    MONITORING = "monitoring"
    DATA_PROCESSING = "data_processing"

@dataclass
class AgentRegistration:
    """Agent registration information"""
    agent_id: str
    agent_name: str
    agent_type: str
    disciplines: List[str]
    capabilities: List[str]
    services: List[ServiceType]
    tailscale_address: str
    health_endpoint: str
    api_endpoint: str
    registered_at: datetime = field(default_factory=datetime.now)
    last_heartbeat: Optional[datetime] = None
    health_status: AgentHealth = AgentHealth.UNKNOWN
    load_factor: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class ServiceEndpoint:
    """Service endpoint information"""
    service_type: ServiceType
    agent_id: str
    endpoint_url: str
    capabilities: List[str]
    load_factor: float
    health_status: AgentHealth
    last_updated: datetime

class OpenClawRegistry:
    """Central registry for OpenClaw agents and services"""

    def __init__(self, openclaw_endpoint: str, registry_file: str = "agent-registry.json"):
        self.openclaw_endpoint = openclaw_endpoint
        self.registry_file = registry_file
        self.session: Optional[aiohttp.ClientSession] = None
        self.registered_agents: Dict[str, AgentRegistration] = {}
        self.service_endpoints: Dict[ServiceType, List[ServiceEndpoint]] = {}
        self.health_monitor_task: Optional[asyncio.Task] = None
        self.discovery_task: Optional[asyncio.Task] = None

    async def initialize(self):
        """Initialize the registry system"""
        try:
            # Create HTTP session
            self.session = aiohttp.ClientSession(
                headers={'User-Agent': 'DevForge-Registry/1.0.0'}
            )

            # Load existing registry if available
            await self._load_registry()

            # Start background tasks
            self.health_monitor_task = asyncio.create_task(self._health_monitor())
            self.discovery_task = asyncio.create_task(self._service_discovery())

            logger.info("OpenClaw Registry initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize registry: {e}")
            raise

    async def register_agent(self, registration: AgentRegistration) -> bool:
        """Register an agent with OpenClaw"""
        try:
            # Prepare registration payload
            payload = {
                'agent_id': registration.agent_id,
                'agent_name': registration.agent_name,
                'agent_type': registration.agent_type,
                'disciplines': registration.disciplines,
                'capabilities': registration.capabilities,
                'services': [s.value for s in registration.services],
                'tailscale_address': registration.tailscale_address,
                'health_endpoint': registration.health_endpoint,
                'api_endpoint': registration.api_endpoint,
                'metadata': registration.metadata
            }

            # Register with OpenClaw
            async with self.session.post(
                f"{self.openclaw_endpoint}/agents/register",
                json=payload
            ) as response:
                if response.status == 201:
                    # Store locally
                    self.registered_agents[registration.agent_id] = registration
                    registration.registered_at = datetime.now()

                    # Update service endpoints
                    await self._update_service_endpoints(registration)

                    # Save registry
                    await self._save_registry()

                    logger.info(f"Agent {registration.agent_id} registered successfully")
                    return True
                else:
                    error_text = await response.text()
                    logger.error(f"Registration failed: {response.status} - {error_text}")
                    return False

        except Exception as e:
            logger.error(f"Registration error for {registration.agent_id}: {e}")
            return False

    async def unregister_agent(self, agent_id: str) -> bool:
        """Unregister an agent from OpenClaw"""
        try:
            # Unregister from OpenClaw
            async with self.session.delete(
                f"{self.openclaw_endpoint}/agents/{agent_id}"
            ) as response:
                if response.status in [200, 204]:
                    # Remove locally
                    if agent_id in self.registered_agents:
                        del self.registered_agents[agent_id]

                    # Update service endpoints
                    await self._remove_agent_services(agent_id)

                    # Save registry
                    await self._save_registry()

                    logger.info(f"Agent {agent_id} unregistered successfully")
                    return True
                else:
                    logger.warning(f"Unregistration failed: {response.status}")
                    return False

        except Exception as e:
            logger.error(f"Unregistration error for {agent_id}: {e}")
            return False

    async def discover_services(self, service_type: ServiceType,
                              disciplines: List[str] = None,
                              capabilities: List[str] = None) -> List[ServiceEndpoint]:
        """Discover available service endpoints"""
        try:
            if service_type not in self.service_endpoints:
                return []

            endpoints = self.service_endpoints[service_type].copy()

            # Filter by disciplines if specified
            if disciplines:
                endpoints = [
                    ep for ep in endpoints
                    if any(d in ep.capabilities for d in disciplines)
                ]

            # Filter by capabilities if specified
            if capabilities:
                endpoints = [
                    ep for ep in endpoints
                    if any(c in ep.capabilities for c in capabilities)
                ]

            # Sort by load factor (lower is better) and health
            endpoints.sort(key=lambda x: (x.load_factor, 0 if x.health_status == AgentHealth.HEALTHY else 1))

            return endpoints[:10]  # Return top 10

        except Exception as e:
            logger.error(f"Service discovery error: {e}")
            return []

    async def get_agent_status(self, agent_id: str) -> Optional[AgentRegistration]:
        """Get current status of an agent"""
        return self.registered_agents.get(agent_id)

    async def update_agent_health(self, agent_id: str, health: AgentHealth, load_factor: float):
        """Update agent health status"""
        if agent_id in self.registered_agents:
            agent = self.registered_agents[agent_id]
            agent.health_status = health
            agent.load_factor = load_factor
            agent.last_heartbeat = datetime.now()

            # Update service endpoints
            await self._update_agent_health(agent_id, health, load_factor)

    async def _health_monitor(self):
        """Background health monitoring task"""
        while True:
            try:
                for agent_id, agent in list(self.registered_agents.items()):
                    try:
                        # Check health endpoint
                        async with self.session.get(
                            agent.health_endpoint,
                            timeout=aiohttp.ClientTimeout(total=5)
                        ) as response:
                            if response.status == 200:
                                health_data = await response.json()
                                load_factor = health_data.get('load_factor', 0.0)
                                await self.update_agent_health(agent_id, AgentHealth.HEALTHY, load_factor)
                            else:
                                await self.update_agent_health(agent_id, AgentHealth.UNHEALTHY, 1.0)

                    except asyncio.TimeoutError:
                        await self.update_agent_health(agent_id, AgentHealth.DEGRADED, 0.8)
                    except Exception as e:
                        logger.warning(f"Health check failed for {agent_id}: {e}")
                        await self.update_agent_health(agent_id, AgentHealth.UNHEALTHY, 1.0)

                # Check for stale agents (no heartbeat for 5 minutes)
                cutoff_time = datetime.now() - timedelta(minutes=5)
                stale_agents = [
                    agent_id for agent_id, agent in self.registered_agents.items()
                    if agent.last_heartbeat and agent.last_heartbeat < cutoff_time
                ]

                for agent_id in stale_agents:
                    logger.warning(f"Agent {agent_id} appears stale, marking as unhealthy")
                    await self.update_agent_health(agent_id, AgentHealth.UNHEALTHY, 1.0)

            except Exception as e:
                logger.error(f"Health monitoring error: {e}")

            await asyncio.sleep(30)  # Check every 30 seconds

    async def _service_discovery(self):
        """Background service discovery task"""
        while True:
            try:
                # Query OpenClaw for current agent list
                async with self.session.get(f"{self.openclaw_endpoint}/agents") as response:
                    if response.status == 200:
                        openclaw_agents = await response.json()

                        # Update our registry with any new agents
                        for agent_data in openclaw_agents:
                            agent_id = agent_data['agent_id']
                            if agent_id not in self.registered_agents:
                                # Create registration from OpenClaw data
                                registration = AgentRegistration(
                                    agent_id=agent_id,
                                    agent_name=agent_data.get('agent_name', agent_id),
                                    agent_type=agent_data.get('agent_type', 'unknown'),
                                    disciplines=agent_data.get('disciplines', []),
                                    capabilities=agent_data.get('capabilities', []),
                                    services=[ServiceType(s) for s in agent_data.get('services', [])],
                                    tailscale_address=agent_data.get('tailscale_address', ''),
                                    health_endpoint=agent_data.get('health_endpoint', ''),
                                    api_endpoint=agent_data.get('api_endpoint', ''),
                                    metadata=agent_data.get('metadata', {})
                                )
                                self.registered_agents[agent_id] = registration
                                await self._update_service_endpoints(registration)

            except Exception as e:
                logger.error(f"Service discovery error: {e}")

            await asyncio.sleep(60)  # Discover every minute

    async def _update_service_endpoints(self, registration: AgentRegistration):
        """Update service endpoints for a registered agent"""
        for service_type in registration.services:
            if service_type not in self.service_endpoints:
                self.service_endpoints[service_type] = []

            endpoint = ServiceEndpoint(
                service_type=service_type,
                agent_id=registration.agent_id,
                endpoint_url=registration.api_endpoint,
                capabilities=registration.capabilities,
                load_factor=registration.load_factor,
                health_status=registration.health_status,
                last_updated=datetime.now()
            )

            # Remove existing endpoint for this agent
            self.service_endpoints[service_type] = [
                ep for ep in self.service_endpoints[service_type]
                if ep.agent_id != registration.agent_id
            ]

            # Add new endpoint
            self.service_endpoints[service_type].append(endpoint)

    async def _remove_agent_services(self, agent_id: str):
        """Remove all services for an agent"""
        for service_type in self.service_endpoints:
            self.service_endpoints[service_type] = [
                ep for ep in self.service_endpoints[service_type]
                if ep.agent_id != agent_id
            ]

    async def _update_agent_health(self, agent_id: str, health: AgentHealth, load_factor: float):
        """Update health status for agent's service endpoints"""
        for service_type in self.service_endpoints:
            for endpoint in self.service_endpoints[service_type]:
                if endpoint.agent_id == agent_id:
                    endpoint.health_status = health
                    endpoint.load_factor = load_factor
                    endpoint.last_updated = datetime.now()

    async def _load_registry(self):
        """Load registry from file"""
        try:
            if os.path.exists(self.registry_file):
                with open(self.registry_file, 'r') as f:
                    data = json.load(f)

                # Reconstruct registrations
                for agent_data in data.get('agents', []):
                    registration = AgentRegistration(**agent_data)
                    self.registered_agents[registration.agent_id] = registration
                    await self._update_service_endpoints(registration)

                logger.info(f"Loaded {len(self.registered_agents)} agents from registry")

        except Exception as e:
            logger.warning(f"Failed to load registry: {e}")

    async def _save_registry(self):
        """Save registry to file"""
        try:
            data = {
                'agents': [
                    {
                        'agent_id': reg.agent_id,
                        'agent_name': reg.agent_name,
                        'agent_type': reg.agent_type,
                        'disciplines': reg.disciplines,
                        'capabilities': reg.capabilities,
                        'services': [s.value for s in reg.services],
                        'tailscale_address': reg.tailscale_address,
                        'health_endpoint': reg.health_endpoint,
                        'api_endpoint': reg.api_endpoint,
                        'registered_at': reg.registered_at.isoformat(),
                        'last_heartbeat': reg.last_heartbeat.isoformat() if reg.last_heartbeat else None,
                        'health_status': reg.health_status.value,
                        'load_factor': reg.load_factor,
                        'metadata': reg.metadata
                    }
                    for reg in self.registered_agents.values()
                ],
                'last_updated': datetime.now().isoformat()
            }

            with open(self.registry_file, 'w') as f:
                json.dump(data, f, indent=2, default=str)

        except Exception as e:
            logger.error(f"Failed to save registry: {e}")

    async def shutdown(self):
        """Shutdown the registry system"""
        logger.info("Shutting down OpenClaw Registry")

        # Cancel background tasks
        if self.health_monitor_task:
            self.health_monitor_task.cancel()
        if self.discovery_task:
            self.discovery_task.cancel()

        # Close session
        if self.session:
            await self.session.close()

        # Save final registry
        await self._save_registry()

        logger.info("OpenClaw Registry shutdown complete")

class AgentCoordinator:
    """Coordinates agent discovery and load balancing"""

    def __init__(self, registry: OpenClawRegistry):
        self.registry = registry
        self.coordination_cache: Dict[str, List[str]] = {}
        self.cache_expiry: Dict[str, datetime] = {}

    async def find_optimal_agent(self, service_type: ServiceType,
                               requirements: Dict[str, Any]) -> Optional[str]:
        """Find the optimal agent for a service request"""
        try:
            endpoints = await self.registry.discover_services(
                service_type=service_type,
                disciplines=requirements.get('disciplines'),
                capabilities=requirements.get('capabilities')
            )

            if not endpoints:
                return None

            # Select best endpoint (healthy, lowest load)
            healthy_endpoints = [
                ep for ep in endpoints
                if ep.health_status == AgentHealth.HEALTHY
            ]

            if not healthy_endpoints:
                return None

            # Return agent with lowest load
            best_endpoint = min(healthy_endpoints, key=lambda x: x.load_factor)
            return best_endpoint.agent_id

        except Exception as e:
            logger.error(f"Agent coordination error: {e}")
            return None

    async def coordinate_task_execution(self, task_requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Coordinate task execution across multiple agents"""
        try:
            primary_service = ServiceType.TASK_EXECUTION
            primary_agent = await self.find_optimal_agent(primary_service, task_requirements)

            if not primary_agent:
                return {'error': 'No suitable agent found'}

            # Find supporting agents for coordination
            support_requirements = task_requirements.copy()
            support_requirements['capabilities'] = ['coordination', 'knowledge_sharing']

            support_agents = []
            support_endpoints = await self.registry.discover_services(
                service_type=ServiceType.COORDINATION,
                disciplines=task_requirements.get('disciplines', [])
            )

            # Select up to 3 support agents
            for endpoint in support_endpoints[:3]:
                if endpoint.health_status == AgentHealth.HEALTHY:
                    support_agents.append(endpoint.agent_id)

            return {
                'primary_agent': primary_agent,
                'support_agents': support_agents,
                'coordination_strategy': 'parallel_support'
            }

        except Exception as e:
            logger.error(f"Task coordination error: {e}")
            return {'error': str(e)}

    async def get_network_topology(self) -> Dict[str, Any]:
        """Get current network topology information"""
        try:
            topology = {
                'total_agents': len(self.registry.registered_agents),
                'healthy_agents': sum(
                    1 for agent in self.registry.registered_agents.values()
                    if agent.health_status == AgentHealth.HEALTHY
                ),
                'services_available': {
                    service_type.value: len(endpoints)
                    for service_type, endpoints in self.registry.service_endpoints.items()
                },
                'agent_distribution': {}
            }

            # Agent distribution by type
            type_counts = {}
            for agent in self.registry.registered_agents.values():
                agent_type = agent.agent_type
                type_counts[agent_type] = type_counts.get(agent_type, 0) + 1

            topology['agent_distribution'] = type_counts

            return topology

        except Exception as e:
            logger.error(f"Topology retrieval error: {e}")
            return {}

# Utility functions
def get_tailscale_address() -> str:
    """Get the Tailscale IP address of this machine"""
    try:
        # Try to get Tailscale IP (this is a simplified implementation)
        # In production, this would query Tailscale's API or configuration
        hostname = socket.gethostname()
        return socket.gethostbyname(hostname)
    except Exception:
        return "127.0.0.1"

def generate_agent_id(agent_name: str) -> str:
    """Generate a unique agent ID"""
    timestamp = str(int(time.time()))
    name_hash = hashlib.md5(agent_name.encode()).hexdigest()[:6]
    return f"{name_hash}-{timestamp}"

# Example usage
async def main():
    """Example registry usage"""

    # Initialize registry
    registry = OpenClawRegistry(
        openclaw_endpoint="http://openclaw.local:8080",
        registry_file="devforge-registry.json"
    )

    await registry.initialize()

    # Create coordinator
    coordinator = AgentCoordinator(registry)

    try:
        # Example agent registration
        registration = AgentRegistration(
            agent_id=generate_agent_id("orion"),
            agent_name="Orion Chief Operations",
            agent_type="executive",
            disciplines=["operations", "strategy", "finance"],
            capabilities=["task_coordination", "performance_monitoring", "decision_support"],
            services=[ServiceType.TASK_EXECUTION, ServiceType.COORDINATION, ServiceType.MONITORING],
            tailscale_address=get_tailscale_address(),
            health_endpoint="http://localhost:8081/health",
            api_endpoint="http://localhost:8080/api",
            metadata={
                'version': '1.0.0',
                'max_concurrent_tasks': 5,
                'memory_profile': 'enterprise'
            }
        )

        # Register agent
        success = await registry.register_agent(registration)
        if success:
            logger.info(f"Agent {registration.agent_id} registered successfully")

            # Test service discovery
            task_endpoints = await registry.discover_services(
                ServiceType.TASK_EXECUTION,
                disciplines=['operations']
            )
            logger.info(f"Found {len(task_endpoints)} task execution endpoints")

            # Test coordination
            coordination_result = await coordinator.coordinate_task_execution({
                'disciplines': ['operations', 'engineering'],
                'capabilities': ['automation', 'optimization']
            })
            logger.info(f"Coordination result: {coordination_result}")

            # Get network topology
            topology = await coordinator.get_network_topology()
            logger.info(f"Network topology: {topology}")

        # Keep running for monitoring
        await asyncio.sleep(60)

    except Exception as e:
        logger.error(f"Registry example failed: {e}")

    finally:
        # Shutdown
        await registry.shutdown()

if __name__ == "__main__":
    asyncio.run(main())