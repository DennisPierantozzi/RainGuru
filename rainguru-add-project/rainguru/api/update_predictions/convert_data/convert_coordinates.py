import itertools
import numpy as np
import pyproj

size = 480


def expandgrid(*itrs): # https://stackoverflow.com/a/12131385/1100107
    """
    Cartesian product. Reversion is for compatibility with R.

    """
    product = list(itertools.product(*reversed(itrs)))
    return np.array([[x[i] for x in product] for i in range(len(itrs))][::-1])


def get_radar_grid():
    """
    Computes a list of coordinates corresponding to every value of the model output matrix
    :return: The aforementioned list
    """

    # Grid size is 700 x 765 pixels
    # Coordinates can be given in lat/lon or stereographic projection (m)
    # corners are (0,49.36206),(0,55.973602),(10.856429,55.388973),(9.00928,48.8953) in WGS84

    nx = 700
    ny = 765
    dx = 1
    dy = 1
    x0 = 0
    y0 = -4415002.329 # needs to be in m instead of km for the pyproj, this is the WGS84 coordinate 49.36206

    seqx = np.linspace(1,nx,nx)*1000 - dx/2 + x0
    seqy = np.linspace(ny,1, ny)*1000 - dy/2 + y0
    # select the pixels we are interested in
    seqx = seqx[int((141 + ((480 - size) / 2))):int((141 + 480 - (480 - size) / 2))]
    seqy = seqy[int((141 + ((480 - size) / 2))):int((141 + 480 - (480 - size) / 2))]
    # make a grid out of it
    xy = expandgrid(seqx, seqy)

    # transform these stereographic coordinates to WGS84
    stere = pyproj.Proj("+proj=stere +lat_0=90 +lon_0=0 +lat_ts=60 +a=6378140 +b=6356750 +x_0=0 y_0=0")
    WGS84 = pyproj.Proj("+proj=longlat +datum=WGS84 +no_defs")
    xy[0], xy[1] = pyproj.transform(stere, WGS84, xy[0], xy[1])

    return xy


def reshape_coordinates_matrix():
    """
    Convert the matrix produced by the get_radar_grid() method from shape (2, 230400) to (480, 480, 2)

    :return: The newly computed matrix
    """
    coords = get_radar_grid()
    matrix = np.zeros((size, size, 2))
    for x in range(size):
        for y in range(size):
            lat = coords[0][x + y * size]
            lon = coords[1][x + y * size]
            matrix[x][y][0] = lon
            matrix[x][y][1] = lat
    return matrix


coordinates_matrix = reshape_coordinates_matrix()


def get_coordinates_matrix():
    return coordinates_matrix

# Print corners of the projection
print(str(coordinates_matrix[0][0][0]) + ', ' + str(coordinates_matrix[0][0][1]))
print(str(coordinates_matrix[size - 1][0][0]) + ', ' + str(coordinates_matrix[size - 1][0][1]))
print(str(coordinates_matrix[0][size - 1][0]) + ', ' + str(coordinates_matrix[0][size - 1][1]))
print(str(coordinates_matrix[size - 1][size - 1][0]) + ', ' + str(coordinates_matrix[size - 1][size - 1][1]))
