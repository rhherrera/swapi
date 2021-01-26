import csv
import datetime
import json
from collections import OrderedDict

import petl as etl
import requests
from dateutil import parser
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
# from tutorial.quickstart.serializers import UserSerializer, GroupSerializer
from api.starwars.models import FileMetadata 


PEOPLE_ENDPOINT = 'https://swapi.dev/api/people'
PLANETS_ENDPOINT = 'https://swapi.dev/api/planets'

class DataSetViewSet(ViewSet):

    def _get_planets(self):
        planets = requests.get(PLANETS_ENDPOINT).json()
        planets_dict = {planet['url']:planet['name'] for planet in planets["results"]}
        while planets["next"]:
            planets = requests.get(planets["next"]).json()
            planets_dict.update({planet['url']:planet['name'] for planet in planets["results"]})
        return planets_dict

    def list(self, request):
        queryset = FileMetadata.objects.all()
        usernames = [{'filename': metadata.filename, 'date': metadata.date, 'id': metadata.id} for metadata in FileMetadata.objects.all()]
        return Response(usernames)

    def create(self, request):
        """
        Creates a csv file with the timestamp as the name and save the info of the file in FileMetadata.
        """
        planets_dict = self._get_planets()
        people = requests.get(PEOPLE_ENDPOINT).json()
        headers = None
        now = datetime.datetime.now()
        filename = f'{str(int(now.timestamp()))}.csv'
        with open(filename, 'w') as csv_file:
            writer = csv.writer(csv_file, delimiter=',')
            while people['next']:
                for person in people['results']:
                    person['homeworld'] = planets_dict.get(person['homeworld'], None)
                    person.pop('starships', None)
                    person.pop('vehicles', None)
                    person.pop('species', None)
                    person.pop('films', None)
                    person.pop('created', None)
                    breakpoint()
                    date = parser.isoparse(person.pop('edited'))
                    person['date'] = date.strftime('%Y-%m-%d')
                    if not headers:
                        headers = list(person.keys())
                        writer.writerow(headers)                        
                    writer.writerow(person.values())
                people = requests.get(people['next']).json() 
        filemetadata = FileMetadata(filename=filename, date=now)
        filemetadata.save()
        
        return Response({"message": "Data retrieved", "file_name": filename, 'id': filemetadata.id})

    def retrieve(self, request, pk=None):
        start_at = int(request.query_params.get('start_at', '0'))
        filemetadata = FileMetadata.objects.get(id=pk)
        table = etl.fromcsv(filemetadata.filename)
        fields = request.query_params.get('fields', None)
        sort = request.query_params.get('sort', None)
        if fields:
            aggregation = OrderedDict()
            aggregation['count'] = len
            fields = fields.split(',')
            if len(fields) > 1:
                table = etl.aggregate(table, key=(fields), aggregation=aggregation)
            else:
                table = etl.aggregate(table, fields[0], aggregation=aggregation)
        if sort:
            sort = sort.split(',')
            if len(sort) > 1:
                table = etl.sort(table, key=(sort))
            else:
                table = etl.sort(table, sort[0])

        last = start_at + 10
        table2 = etl.rowslice(table, start_at, last)
        sink = etl.MemorySource()
        table2.tojson(sink)
        return Response(
            {'pagination': {
                'next': last if last < len(table) -1 else None,
                'count': len(table) -1
            },
            'data':json.loads(sink.getvalue())
        })



