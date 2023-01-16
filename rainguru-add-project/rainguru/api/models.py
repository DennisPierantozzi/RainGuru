import datetime

from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.db.models import UniqueConstraint
from django.db.models import JSONField


class Observed(models.Model):
    time = models.DateTimeField(primary_key=True, default=datetime.datetime(2022, 4, 18))
    matrix_data = ArrayField(ArrayField(models.DecimalField(max_digits=5, decimal_places=2), blank=True), default=list)
    matrix_data_fast = JSONField()


class Predicted(models.Model):
    calculation_time = models.DateTimeField()
    prediction_time = models.DateTimeField()
    matrix_data = ArrayField(ArrayField(models.DecimalField(max_digits=5, decimal_places=2), blank=True), default=list)
    matrix_data_fast = JSONField()
    
    class Meta:
        unique_together = ['calculation_time', 'prediction_time']

