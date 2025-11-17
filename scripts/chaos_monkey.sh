#!/bin/bash

MIN_INTERVAL=${1:-10}
MAX_INTERVAL=${2:-15}
FOLDER_NAME="tfu5_ada2"

echo "El mono loco está suelto"
echo "Intervalo: ${MIN_INTERVAL}s - ${MAX_INTERVAL}s"

SERVICES=("customer-service" "product-service", "order-service")

get_running_containers() {
    local service=$1
    docker ps --filter "name=${FOLDER_NAME}-${service}" --format "{{.Names}}" | grep "^${FOLDER_NAME}-${service}"
}

count_running_containers() {
    local service=$1
    get_running_containers "$service" | wc -l | xargs
}

kill_random_container() {
    local service=$1
    local running_count=$(count_running_containers "$service")
    
    if [ "$running_count" -le 1 ]; then
        echo "Solo hay $running_count instancia(s) de $service - La skippeo"
        return 1
    fi
    
    # Obtener un container aleatorio
    local containers=($(get_running_containers "$service"))
    local random_index=$((RANDOM % ${#containers[@]}))
    local target_container="${containers[$random_index]}"
    
    echo "Apagando: $target_container (van a quedar $((running_count - 1)) instancias)"
    docker stop "$target_container" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "Container apagado exitosamente"
        return 0
    else
        echo "Error al apagar container"
        return 1
    fi
}

while true; do
    wait_time=$((MIN_INTERVAL + RANDOM % (MAX_INTERVAL - MIN_INTERVAL + 1)))
    
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo ""
    echo "[$timestamp] Próximo ataque en ${wait_time}s..."
    sleep "$wait_time"
    
    service_index=$((RANDOM % ${#SERVICES[@]}))
    target_service="${SERVICES[$service_index]}"
    
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo ""
    echo "[$timestamp] - Target: $target_service"
    
    current_count=$(count_running_containers "$target_service")
    echo "Instancias actuales: $current_count"
    
    kill_random_container "$target_service"
    
    new_count=$(count_running_containers "$target_service")
    echo "Instancias después del ataque: $new_count"
    
done
