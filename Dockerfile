FROM nginx:alpine

# Copiar archivos estáticos de la aplicación al directorio de Nginx
COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
