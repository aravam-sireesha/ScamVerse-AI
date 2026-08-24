from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging

logger = logging.getLogger("uvicorn")

class MongoClientManager:
    client: AsyncIOMotorClient = None
    db = None

    async def connect_to_db(self):
        try:
            # Set a 2-second timeout for server selection
            self.client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
            # Trigger a ping to verify connection
            await self.client.admin.command('ping')
            self.db = self.client[settings.DATABASE_NAME]
            logger.info("Successfully connected to MongoDB Cluster.")
        except Exception as e:
            logger.warning(f"Failed to connect to MongoDB. Running in Mock/Offline mode. Error: {e}")
            self.client = None
            self.db = None

    async def close_db_connection(self):
        if self.client:
            self.client.close()
            logger.info("Closed MongoDB connection pool.")

db_manager = MongoClientManager()

def get_database():
    return db_manager.db
