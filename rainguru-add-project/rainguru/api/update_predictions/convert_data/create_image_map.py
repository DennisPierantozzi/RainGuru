import convert_coordinates
import pickle

from convert_matrix_image import resolution

top_left_lat = 54.71
top_left_lon = 1.90
bottom_right_lat = 50.21
bottom_right_lon = 9.30

coordinates_matrix = convert_coordinates.get_coordinates_matrix()
hashed_coordinates = {}
image_map = {}


def create_image_map():
    """
    Create the mapping between image pixels and matrix values
    """
    for x in range(resolution):
        for y in range(resolution):
            print('current pixel: (' + str(x) + ', ' + str(y) + ')')
            image_map[(x, y)] = nearest_neighbour(x, y)


def hash_coordinates_matrix():
    """
    Hash all coordinates using locality sensitive hashing.
    Create a dictionary that maps these hashes to the list of coordinates that are hashed to the same value.
    """
    for x in range(convert_coordinates.size):
        for y in range(convert_coordinates.size):
            coordinate = coordinates_matrix[x][y]
            hashed_coordinate = hash_coordinate(coordinate)
            if hashed_coordinate not in hashed_coordinates:
                hashed_coordinates[hashed_coordinate] = [[coordinate, x, y]]
            else:
                hashed_coordinates[hashed_coordinate].append([coordinate, x, y])
    print('hash generated')


def hash_coordinate(coordinate):
    """
    Round the coordinate down to create locality sensitive hash
    (so coordinates with similar coordinates will have similar hashes)

    :param coordinate: The coordinate to hash
    :return: the hash of the coordinate
    """
    return round(coordinate[0], 1), round(coordinate[1], 1)


def nearest_neighbour(x, y):
    """
    Find the nearest neighbour of an image pixel by computing the coordinates of that pixel and comparing it to the
    coordinates that the model produces

    :param x: The x coordinate of the image pixel
    :param y: The y coordinate of the image pixel
    :return: The x and y coordinate of the corresponding matrix value.
    (Will return -1, -1 in case there is no corresponding value)
    """
    latitude = top_left_lat + (bottom_right_lat - top_left_lat) * (x / resolution)
    longitude = top_left_lon + (bottom_right_lon - top_left_lon) * (y / resolution)

    nearest_coordinates = 0, 0
    nearest_distance = 1000000
    hashed_coordinate = hash_coordinate([latitude, longitude])

    candidate_list = create_candidate_list(hashed_coordinate)

    if len(candidate_list) == 0:
        return -1, -1
    for candidate in candidate_list:
        current_distance = distance(latitude, longitude, candidate[0][0], candidate[0][1])

        if current_distance < nearest_distance:
            nearest_distance = current_distance
            nearest_coordinates = candidate[1], candidate[2]
    # If the pixel falls outside the bounds
    if nearest_distance > 0.001:
        return -1, -1

    return nearest_coordinates


def create_candidate_list(hashed_coordinate):
    """
    Create a list of nearest neighbour candidates by comparing it with the bucket the coordinate hashes to as well as
    the eight surrounding buckets

    :param hashed_coordinate: The hash of the coordinate to find the nearest neighbour for
    :return: A list of potential nearest neighbours
    """
    candidate_list = []
    for i in range(-1, 2):
        for j in range(-1, 2):
            new_key = (round(hashed_coordinate[0] + i * 0.1, 1), round(hashed_coordinate[1] + j * 0.1, 1))
            if new_key in hashed_coordinates:
                candidate_list.extend(hashed_coordinates[new_key])
    return candidate_list


def distance(lat1, lon1, lat2, lon2):
    """
    Computes the squared distance between two coordinates (assumes 1 lon = 1 lat in terms of distance)

    :param lat1: lat of the first coordinate
    :param lon1: lon of the first coordinate
    :param lat2: lat of the second coordinate
    :param lon2: lon of the second coordinate
    :return: The squared distance
    """
    return (lat1 - lat2) ** 2 + (lon1 - lon2) ** 2


# Create a dictionary of all coordinates with their hash as a key
hash_coordinates_matrix()

# Create a dictionary that maps every image pixel to a matrix coordinate
create_image_map()


# store the dictionary in the file image_map.pickle
image_map_path = 'image_map.pickle'
image_map_file = open(image_map_path, 'wb')
pickle.dump(image_map, image_map_file)
image_map_file.close()

