from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from PIL import Image
import io

import torch
import torch.nn as nn
from torchvision import transforms


# =========================================================
# FastAPI
# =========================================================

app = FastAPI(
    title="Breast Cancer Detection API",
    description="PyTorch CNN for Breast Histopathology Classification",
    version="1.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# Device
# =========================================================

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# =========================================================
# Model
# =========================================================

class Canncer(nn.Module):

    def __init__(self):
        super().__init__()

        self.features = nn.Sequential(

            nn.Conv2d(
                3, 8,
                kernel_size=3,
                stride=1,
                padding=1
            ),

            nn.ReLU(),

            nn.MaxPool2d(2),


            nn.Conv2d(
                8, 16,
                kernel_size=3,
                stride=1,
                padding=1
            ),

            nn.ReLU(),

            nn.MaxPool2d(2)
        )


        self.Classifier = nn.Sequential(

            nn.Linear(
                16 * 7 * 7,
                128
            ),

            nn.ReLU(),

            nn.Linear(
                128,
                2
            )
        )


    def forward(self, x):

        x = self.features(x)

        x = x.view(
            x.size(0),
            -1
        )

        x = self.Classifier(x)

        return x


# =========================================================
# Load Model
# =========================================================

model = Canncer()

model.load_state_dict(
    torch.load(
        "../model/cancer_cnn.pth",
        map_location=device
    )
)

model = model.to(device)

model.eval()


# =========================================================
# Image Transform
# =========================================================

transform = transforms.Compose([

    transforms.Resize((28, 28)),

    transforms.ToTensor()
])


# =========================================================
# Classes
# =========================================================

class_names = [
    "Benign",
    "Malignant"
]


# =========================================================
# Home
# =========================================================

@app.get("/")
def home():

    return {
        "message": "Breast Cancer Classification API",
        "status": "running"
    }


# =========================================================
# Health
# =========================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "model_loaded": True,
        "device": str(device)
    }


# =========================================================
# Prediction
# =========================================================

@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):

    # Read uploaded image
    image_bytes = await file.read()

    # Open image
    image = Image.open(
        io.BytesIO(image_bytes)
    ).convert("RGB")


    # Transform
    image = transform(image)


    # Add batch dimension
    # [3, 28, 28]
    #       ↓
    # [1, 3, 28, 28]

    image = image.unsqueeze(0)


    # Move to device
    image = image.to(device)


    # Prediction
    with torch.no_grad():

        output = model(image)

        probabilities = torch.softmax(
            output,
            dim=1
        )

        confidence, predicted = torch.max(
            probabilities,
            dim=1
        )


    # Get class
    predicted_class = class_names[
        predicted.item()
    ]


    confidence = confidence.item() * 100


    return {

        "prediction": predicted_class,

        "confidence": round(
            confidence,
            2
        )
    }