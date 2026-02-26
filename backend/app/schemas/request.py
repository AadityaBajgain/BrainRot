from pydantic import BaseModel, Field

from schemas.enums import Styles
from typing import Annotated, Optional

class BrainrotRequest(BaseModel):
    topic: Annotated[
        str,
        Field(
            ..., description="Enter the topic of you want to learn about", examples=["Binary Search"],
            min_length=3
        ),
    ]
    
    style:Annotated[
        Styles,
        Field(
            ...,
            description="what style do you want your content to be? (sigma, delulu, conspiracy, npc)",
            examples=["sigma"]
        )
    ]
    
    subject :Annotated[
        Optional[str],
        Field(
            description="describe your topic in a paragraph in less than 50 words (optional)",
            examples=["describe binary search in simple language and in funny way."],
            max_length= 200
        )
    ]
    
    chaos_score : Annotated[
        Optional[int],
        Field(
            description="How chaotic do you want your content to be? (out of 100)",
            examples=[100, 5, 49],
            ge=1,
            le=100
        )
    ]