FROM nginx:alpine

# Copy static site into nginx html folder
COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
