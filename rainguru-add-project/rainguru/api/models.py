import datetime

from django.contrib.postgres.fields import ArrayField
from django.db import models


class Observed(models.Model):
    time = models.DateTimeField(primary_key=True, default=datetime.datetime(2022, 4, 18))
    matrix_data = ArrayField(ArrayField(models.DecimalField(max_digits=5, decimal_places=2), blank=True), default=list)


class Predicted(models.Model):
    calculation_time = models.DateTimeField()
    prediction_time = models.DateTimeField()
    matrix_data = ArrayField(ArrayField(models.DecimalField(max_digits=5, decimal_places=2), blank=True), default=list)
