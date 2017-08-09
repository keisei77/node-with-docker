# Setup

#### 1. Run docker

#### 2. Run keisei-ubuntu container

#### 3. Execute the command:
    docker exec -it keisei bash

    docker run -p 49160:8080 -p 3000:3000 -v f:/repositories:/var/host-data -it keisei77/keisei-ubuntu bash

    docker commit <containerId/containerName> username/imagename

    前端开发环境 docker 镜像
    https://github.com/springjk/web-dev-docker