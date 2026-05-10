#!/bin/sh
npx prisma db push
node_modules/.bin/next start
