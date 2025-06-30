# pryoecto_admin

Descripción
- user-service: gestiona usuarios.
- task-service: gestiona tareas asociadas a usuarios.
- nginx-proxy: actúa como API Gateway, balanceador de carga y proxy seguro.
--------------------------------------------------------------------------
Estructura del proyecto
├── docker-compose.yml
├── nginx-proxy/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── certs/
│       ├── cert.pem
│       └── key.pem
├── task-service/
│   ├── app.js
│   ├── Dockerfile
│   ├── package.json
│   └── tasks.db
└── user-service/
    ├── app.js
    ├── Dockerfile
    ├── package.json
    └── users.db
--------------------------------------------------------------------------
Servicios
-user-service
    - API REST para registrar, listar y consultar usuarios.
    - Base de datos SQLite ("users.db").
    - Corre en el puerto "3001".

Endpoints de users
- POST /users: crea un usuario.
- GET /users: lista todos los usuarios.
- GET /users/:id: obtiene un usuario por ID.
- GET /users/health: healthcheck.

-task-service
    - API REST para crear, listar y actualizar tareas.
    - Cada tarea está asociada a un usuario existente.
    - Base de datos SQLite ("tasks.db").
    - Corre en el puerto "3002".

Endpoints de tasks
- POST /tasks: crea una tarea (requiere "user_id" válido).
- GET /tasks: lista todas las tareas o filtra por usuario.
- GET /tasks/:id: obtiene una tarea por ID.
- PUT /tasks/:id: actualiza el estado de una tarea.
- GET /tasks/health: healthcheck.
- GET /tasks/?user_id=x: filtra las tareas por el usuario x 

nginx-proxy
- API Gateway y balanceador de carga.
- Expone los servicios bajo HTTPS en "/api/users/" y "/api/tasks/".
- Redirige HTTP a HTTPS.
- Certificados en "nginx-proxy/certs/".
--------------------------------------------------------------------------
Despliegue

-Requisitos
    - Docker
    - Docker Compose

Pasos
    1. Clona el repositorio y navega a la carpeta raíz.
    2. Asegúrate de tener los certificados SSL en "nginx-proxy/certs/cert.pem" y "key.pem".
    3. Construye y levanta los servicios:
        docker-compose up --build -d

    4. Accede a la API Gateway:
        - Usuarios: "https://localhost/api/users/"
        - Tareas: "https://localhost/api/tasks/"
        - Estado del gateway: "https://localhost/admin"
        Por usar certificados autofirmados, el navegador mostrará una advertencia de seguridad.
--------------------------------------------------------------------------
Persistencia
- Las bases de datos SQLite se montan como volúmenes para persistencia local.
--------------------------------------------------------------------------
Seguridad
- El API Gateway implementa HTTPS, rate limiting y headers de seguridad.
- Los servicios internos no están expuestos directamente al exterior.