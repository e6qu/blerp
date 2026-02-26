resource "aws_ecr_repository" "blerp_api" {
  name                 = "blerp-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Project = "Blerp"
    Environment = "Production"
  }
}

resource "aws_ecr_lifecycle_policy" "blerp_api_policy" {
  repository = aws_ecr_repository.blerp_api.name

  policy = <<EOF
{
    "rules": [
        {
            "rulePriority": 1,
            "description": "Keep last 30 images",
            "selection": {
                "tagStatus": "any",
                "countType": "imageCountMoreThan",
                "countNumber": 30
            },
            "action": {
                "type": "expire"
            }
        }
    ]
}
EOF
}
