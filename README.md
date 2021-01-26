# swapi
swapi app and api.

TO RUN THIS APP YOU NEED TO INSTALL PIPENV AND NPM.

1. Clone the repository to a local folder.
2. On a terminal, go to that local folder.
3. run `pipenv install`
4. run `pipenv shell`
5. run `python manage.py migrate`
6. run `python manage.py runserver`
At this point you should have the API running on the localhost:8000, go to the browser and enter `http://localhost:8000/dataset/` to check that is working.
7. In a new terminal open the folder where the repository is located.
8. run `cd frontend`
9. run `npm install`
10. run `npm start`
11. A browser should open pointing to the url `http://localhost:3000` there you have the app. Enjoy it :) 


Some extra comments:
1. Inside the file inspector you will find a multi-dropbox for filtering, allowing to select or unselect all.
2. The load more works propertly with or without filters.
3. The API support sorting by any field, but the frontend doesn't.