from fastapi import FastAPI
app = FastAPI(title="HireFlow API")

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/")
async def root():
    return {"message": "Welcome to HireFlow"}
