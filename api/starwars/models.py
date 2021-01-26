from django.db import models


class FileMetadata(models.Model):
    filename = models.CharField(max_length=200)
    date = models.DateTimeField('edited date')
