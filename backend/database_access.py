
#THIS file just provides a connection to the database


from sqlalchemy import create_engine


"""
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sakshamaggarwal
DB_USER=sakshamaggarwal
DB_PASS=1234


#.env files has been deleted for now
from dotenv import load_dotenv
load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")


DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
"""

db_path = "database/integral_education_database.db"
DATABASE_URL = f"sqlite:///{db_path}"

engine = create_engine(DATABASE_URL)


def get_engine():
    return engine

