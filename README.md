# pryoecto_admin
--------------------------------------------------------------------------
(Para este proyecto ya avance con el de la unidad 3 por eso estoy usando certificados autofirmados que no se pedían en esta fase del proyecto)
--------------------------------------------------------------------------
Proyecto de administración de redes y sistemas computaciones, el cual consiste en crear y administrar usuarios y tareas basado en microservicios, usando Node.js, Express, SQLite y Nginx como API Gateway seguro. 
--------------------------------------------------------------------------
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

-nginx-proxy
    - Expone los servicios bajo HTTPS:
        - Users: "https://localhost/api/users/"
        - Tasks: "https://localhost/api/tasks/"
        - Estado del gateway: "https://localhost/admin"
    - Redirige HTTP a HTTPS.(es parte de la unidad 3)
    - Certificados en "nginx-proxy/certs/" (es parte de la unidad 3)
--------------------------------------------------------------------------
Despliegue:

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
            Por usar certificados autofirmados, el navegador mostrará una advertencia de seguridad.(es parte de la unidad 3)
--------------------------------------------------------------------------
- Las bases de datos SQLite se cargan como volúmenes para persistencia local.
--------------------------------------------------------------------------
Seguridad (es parte de la unidad 3)
- El API Gateway implementa HTTPS, rate limiting y headers de seguridad.
- Los servicios internos no están expuestos directamente al exterior.
--------------------------------------------------------------------------
Casos de prueba en Postman:

-Obtener o mostrar todos los usuarios o users:
    Método: GET
    URL: http://localhost/api/users/

-Obtener o mostrar todas las tareas o tasks:
    Método: GET
    URL: http://localhost/api/tasks/

-Agregar un usuario o user:
    Método: POST
    URL: http://localhost/api/users/
    Body:
    Selecciona raw y JSON.
    Ejemplo:
    {
      "name": "Ricardo Perez",
      "email": "ricardo@example.com"
    }   
-Agregar un tarea o task:
    Método: POST
    URL: http://localhost/api/tasks/
    Body:
    Selecciona raw y JSON.(asegúrate de usar un user_id válido):
    {
      "title": "Tarea de ejemplo",
      "description": "Descripción opcional",
      "user_id": 1
    }

-Actualizar una tarea o task:
    Método: PUT
    URL: http://localhost/api/tasks/1
    Body:
    Selecciona raw y JSON.
    {
      "status": "completada"
    }

-Ver el estado de healthcheck del servicio de usuarios o users:
    http://localhost/api/users/health

-Ver el estado de healthcheck del servicio de tareas o tasks:
    http://localhost/api/tasks/health
--------------------------------------------------------------------------