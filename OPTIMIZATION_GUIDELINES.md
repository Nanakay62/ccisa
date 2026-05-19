# Local AI Optimization Guidelines
*Strategies for fast, efficient WebAssembly ML inference on consumer devices.*

## 1. Quantization Formats & Runtime Configurations

To run LLMs entirely in the browser efficiently, minimizing memory footprints and computational overhead is crucial.
- **Model Sizes**: Restrict model sizes to maximum 1.5B parameters for browser usage. 
- **Quantization (INT4 & INT8)**:
  - Default to **INT4 (4-bit quantization)** (e.g., Q4) for maximum speed and memory savings (reduces size by up to 75% compared to FP16, at a minor accuracy cost).
  - Use **INT8 (8-bit)** if specific complex tasks require deeper reasoning accuracy (saves 50%).
- **WebAssembly Runtime Config**:
  - Maximize the available hardware concurrency limit.
  - Rely on \`dtype: 'q4'\` alongside \`quantized: true\` in HuggingFace Transformers.js configurations to explicitly pull lightweight model artifacts from CDN edge nodes.

### Code Snippet Reference:
\`\`\`typescript
import { pipeline, env } from '@xenova/transformers';

// 1. Enable hardware concurrency & SIMD (if available) for WASM backend.
env.backends.onnx.wasm.numThreads = Math.min(navigator.hardwareConcurrency || 4, 8);
env.backends.onnx.wasm.simd = true; // Use Vectorized operations

// 2. Fetch Q4 models aggressively to maximize speed over accuracy
generator = await pipeline('text-generation', modelId, {
    dtype: 'q4',
    quantized: true
});
\`\`\`

## 2. Best Practices: Balancing Speed, Accuracy & Resource Usage

### Strict Context Window Constraints
LLM attention computation time increases quadratically ($O(N^2)$) with context length. Processing a full book or long document (e.g., 50k tokens) might freeze mobile browsers entirely.
- Cap strict input context limits (e.g., \`2000 - 3000\` characters).
- **RAG over Infinite Context**: When asked to summarize or query a long text, strictly rely on generating query embeddings first and fetching only top $k$ chunks (e.g., top 3 paragraphs). 

### Max New Token Control
Predicting tokens one-by-one is the primary CPU bottleneck.
- Reduce \`max_new_tokens\` heavily (e.g., 100-200) so the inference loop concludes faster.
- Lower \`temperature\` to \`0.1\` and tighten \`top_k\` to \`10\` for direct, narrow token path sampling, speeding up prediction confidence arrays.

### UI Parallelism
- Unify streaming text components (via callback) to establish perceived speed, allowing users to begin reading seconds after initiation while computation finishes quietly. 

## 3. Step-by-Step Optimization Checklist

- [x] **Configure Multi-threading**: Confirm that \`env.backends.onnx.wasm.numThreads\` is appropriately bounded (1-8 threads).
- [x] **Force Quantized Downloads**: Explicitly pass \`quantized: true, dtype: 'q4'\` during pipeline construction.
- [x] **Cap Input Sequences**: Enact strict string-cutting on fallback queries. Avoid loading full files into the prompt pipeline string. (Added `context.substring(0, 2500)`)
- [x] **Optimize Generation Limits**: Clamp \`max_new_tokens\` down. Avoid sweeping long-form essay generation natively on device. (Configured at `150`)
- [x] **Chunk Inputs**: Separate processing into individual queries rather than attempting "whole-book generation". (Already solved via `DatabaseManager.search` fallback).
- [ ] **Consider OPFS (Origin Private File System)**: To speed up cold model reloading after initial cache, configure huggingface caches into OPFS. Local environments default to cacheAPI but OPFS offers better sequential IO on models >500mb.
