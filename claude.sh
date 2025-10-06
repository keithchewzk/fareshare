#!/bin/bash
aws sso login --profile cline && \
export AWS_PROFILE=cline && \
export CLAUDE_CODE_USE_BEDROCK=1 && \
export AWS_REGION=us-east-1 && \
export ANTHROPIC_MODEL='us.anthropic.claude-sonnet-4-20250514-v1:0' && \
claude