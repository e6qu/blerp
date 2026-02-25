resource "aws_ecs_cluster" "blerp" {
  name = "blerp-cluster"
}

resource "aws_ecs_task_definition" "blerp_api" {
  family                   = "blerp-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "blerp-api"
      image     = "${aws_ecr_repository.blerp_api.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
        }
      ]
      environment = [
        { name = "NODE_ENV", value = "production" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/blerp-api"
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "blerp_api" {
  name            = "blerp-api-service"
  cluster         = aws_ecs_cluster.blerp.id
  task_definition = aws_ecs_task_definition.blerp_api.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = ["subnet-12345678"] # Placeholders
    security_groups  = ["sg-12345678"]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.blerp_api.arn
    container_name   = "blerp-api"
    container_port   = 3000
  }

  deployment_controller {
    type = "CODE_DEPLOY" # For Blue/Green
  }
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name = "blerp-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_lb_target_group" "blerp_api" {
  name        = "blerp-api-tg"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = "vpc-12345678"

  health_check {
    path = "/health"
  }
}
