#!/bin/bash

echo ""
echo "🚀 Connext Admin Template - Interactive Setup"
echo ""
echo "This script will help you configure your environment variables."
echo ""
echo "Make sure you have:"
echo "✓ Convex account (convex.dev)"
echo "✓ Resend account (resend.com)"
echo ""

# Function to ask question with default
ask_question() {
    local question="$1"
    local default="$2"
    local required="${3:-false}"
    
    if [ -n "$default" ]; then
        question="${question} (default: ${default}): "
    else
        question="${question}: "
    fi
    
    while true; do
        read -p "$question" answer
        answer=$(echo "$answer" | tr -d '[:space:]')
        
        if [ -z "$answer" ] && [ -n "$default" ]; then
            answer="$default"
            break
        elif [ -z "$answer" ] && [ "$required" = "true" ]; then
            echo "⚠️  This field is required. Please try again."
            continue
        elif [ -z "$answer" ] && [ "$required" != "true" ]; then
            answer="$default"
            break
        else
            break
        fi
    done
    
    echo "$answer"
}

# Ask questions
echo "Please provide the following information:"
echo ""

NEXT_PUBLIC_APP_URL=$(ask_question "Enter your app URL" "http://localhost:3000" "false")
CONVEX_DEPLOYMENT=$(ask_question "Enter your Convex deployment URL" "" "true")
RESEND_API_KEY=$(ask_question "Enter your Resend API key" "" "true")
FROM_EMAIL=$(ask_question "Enter sender email" "" "true")
GOOGLE_CLIENT_ID=$(ask_question "Enter your Google Client ID" "" "false")
GOOGLE_CLIENT_SECRET=$(ask_question "Enter your Google Client Secret" "" "false")

echo ""
echo "📝 Generating .env.local file..."
echo ""

# Create .env.local
cat > .env.local << ENVFILE
# Connext Admin Template - Environment Configuration
# Generated on $(date -u +"%Y-%m-%d %H:%M:%S UTC")

NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
CONVEX_DEPLOYMENT=${CONVEX_DEPLOYMENT}
RESEND_API_KEY=${RESEND_API_KEY}
FROM_EMAIL=${FROM_EMAIL}
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
NEXT_PUBLIC_GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
NODE_ENV=development
ENVFILE

echo "✅ Created .env.local file"
echo ""
echo "📦 Next steps:"
echo ""
echo "1. Install dependencies:"
echo "   pnpm install"
echo ""
echo "2. Start Convex dev server:"
echo "   pnpm convex:dev"
echo ""
echo "3. In a new terminal, start the Next.js dev server:"
echo "   pnpm dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "🎉 Setup complete! Happy coding!"
echo ""
