# Campus Map Pathfinding & Coordinate Utilities (Python Edition)
# You can use this logic for generating SVG coordinate paths or routing.

import math
from typing import List, Dict, Tuple, Optional

class Point:
    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y

    def distance_to(self, other: 'Point') -> float:
        """Calculates Euclidean distance between two percentage coordinates."""
        dx = self.x - other.x
        dy = self.y - other.y
        return math.sqrt(dx * dx + dy * dy)

    def to_dict(self) -> Dict[str, float]:
        return {"x": self.x, "y": self.y}


class Building:
    def __init__(self, id: str, name: str, short_name: str, x: float, y: float, category: str):
        self.id = id
        self.name = name
        self.short_name = short_name
        self.x = x
        self.y = y
        self.category = category


def generate_svg_polyline(points: List[Point]) -> str:
    """Generates an SVG path string 'M x1 y1 L x2 y2 ...' from coordinate points."""
    if not points:
        return ""
    # Map percentage (0-100) to SVG coordinate space (0-1000)
    svg_points = [f"{p.x * 10} {p.y * 10}" for p in points]
    return "M " + " L ".join(svg_points)


def calculate_walking_time(distance_meters: float, pace_meters_per_min: float = 75.0) -> int:
    """Calculates estimated walking time in minutes."""
    return max(1, round(distance_meters / pace_meters_per_min))
