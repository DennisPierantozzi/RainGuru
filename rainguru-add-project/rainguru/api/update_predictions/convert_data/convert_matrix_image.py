import numpy as np
import os
import pickle

from PIL import Image

image_map = {}
resolution = 700

# Load the image map from image_map.pickle
try:
    image_map_path = os.path.join('api', 'update_predictions', 'convert_data', 'image_map.pickle')
    image_map_file = open(image_map_path, 'rb')
    image_map = pickle.load(image_map_file)
    image_map_file.close()
except:
    print("Something went wrong while loading the image map. Disregard this message when running the creation script")


def create_image(frame, location):
    """
    Convert matrix into png using image map as a mapping and store it

    :param frame: The matrix to convert to a png
    :param location: The path where to store it
    """
    data = np.zeros((resolution, resolution, 4), dtype=np.uint8)
    for x in range(resolution):
        for y in range(resolution):
            new_x, new_y = image_map[(x, y)]
            if new_x == -1:
                data[x, y] = [0, 0, 0, 0]
            else:
                data[x, y] = compute_color(frame[new_y][new_x])

    img = Image.fromarray(data, 'RGBA')
    img.save(os.path.join(os.path.abspath(os.curdir), location))


def compute_color(precipitation):
    """
    Compute the color for a given precipitation value

    :param precipitation: The value of the precipitation
    :return: The color (list representing RGBA values)
    """

    point1 = 0.1
    point2 = 0.6
    point3 = 1
    point4 = 10
    point5 = 100

    points = [point1, point2, point3, point4, point5]

    color1 = [255, 255, 255, 230]
    color2 = [100, 100, 255, 200]
    color3 = [0, 0, 255, 200]
    color4 = [255, 0, 0, 200]
    color5 = [255, 255, 0, 230]

    colors = [color1, color2, color3, color4, color5]

    if precipitation < 0:
        return [0, 0, 0, 0]

    if precipitation < point1:
        return interpolate_color([255, 255, 255, 0], colors[0], 0, points[0], precipitation)

    for i in range(len(colors) - 1):
        if precipitation < points[i+1]:
            return interpolate_color(colors[i], colors[i+1], points[i], points[i+1], precipitation)

    return colors[len(colors)-1]


def interpolate_color(color1, color2, lower, upper, precipitation):
    """
    Interpolate the color between 2 points given a precipitation value

    :param color1: The color of the lower bound
    :param color2: The color of the upper bound
    :param lower: The value of the lower bound
    :param upper: The value of the upper bound
    :param precipitation: The precipitation value
    :return: The interpolated value
    """
    fraction = (precipitation - lower) / (upper - lower)
    return [color1[0] * (1-fraction) + color2[0] * fraction,
            color1[1] * (1-fraction) + color2[1] * fraction,
            color1[2] * (1-fraction) + color2[2] * fraction,
            color1[3] * (1-fraction) + color2[3] * fraction
            ]