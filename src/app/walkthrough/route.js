const walkthrough = require('@/lib/walkthrough');

export function GET() {
  return new Response(
    JSON.stringify(walkthrough(), null, 2),
    {
      'Content-Type': 'text/plain',
    },
  )
}