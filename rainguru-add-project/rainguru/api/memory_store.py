from datetime import datetime


class Store:
    def __init__(self):
        self.exception_active = True
        self.exception_message = \
            'Server has just been restarted. Please wait for the predictions to be generated and stored'
        # Standard url if the server has just restarted and there are no predictions to fall back on.
        self.urls = ["/media/404.png" for x in range(20)]
        self.matrices = []
        self.predictions_timestamp = datetime.now()

        self.matrices_obs_clicked = []
        self.timestamp_obs_clicked = ""
        self.observed_clicked = False

        self.matrices_pred_clicked = []
        self.timestamp_pred_clicked = ""

    def store_predictions(self, urls, matrices, timestamp):
        """
        Store information about the latest data

        :param urls: The urls of the latest images
        :param matrices: The latest matrices that the model produced
        :param timestamp: The timestamp of the latest predictions
        """
        self.urls = urls
        self.matrices = matrices
        self.predictions_timestamp = timestamp

    def store_observation_clicked(self, matrices, timestamp):
        """
        Store information about the latest data requested

        :param matrices: The latest matrices that the model produced
        :param timestamp: The timestamp of the latest predictions
        :param observed: The boolean value to discriminate observations and predictions
        """

        self.matrices_obs_clicked = matrices
        self.timestamp_obs_clicked = timestamp
        self.observed_clicked = True

    def store_predictions_clicked(self, matrices, timestamp):
        """
        Store information about the latest data requested

        :param matrices: The latest matrices that the model produced
        :param timestamp: The timestamp of the latest predictions
        :param observed: The boolean value to discriminate observations and predictions
        """

        self.matrices_pred_clicked = matrices
        self.timestamp_pred_clicked = timestamp
        self.observed_clicked = False
    

    def fetch_timestamp(self):
        return self.predictions_timestamp

    def fetch_urls(self):
        return self.urls, self.predictions_timestamp

    def fetch_matrices(self):
        return self.matrices


    def fetch_timestamp_obs(self):
        return self.timestamp_obs_clicked

    def fetch_matrices_obs(self):
        return self.matrices_obs_clicked

    def fetch_timestamp_pred(self):
        return self.timestamp_pred_clicked

    def fetch_matrices_pred(self):
        return self.matrices_pred_clicked

    def fetch_observed_clicked(self):
        return self.observed_clicked



    def store_exception(self, message):
        self.exception_active = True
        self.exception_message = message

    def remove_exception(self):
        self.exception_active = False
        self.exception_message = ''

    def is_exception_active(self):
        return self.exception_active

    def get_exception_message(self):
        return self.exception_message


memory_store = Store()



