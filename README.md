# AudioStemExtractor

AudioStemExtractor is a service developed using NestJS that allows users to automatically process songs to extract and download specific audio stems such as bass, drums, and vocals. It leverages the FADR API for handling audio files and supports flexible stem selection.

## Features

- **Upload Songs**: Upload songs directly to a designated S3 bucket via signed URLs. This is provided from FADR. See FADR documentation for more information regarding this matter.
- **Extract Stems**: Automatically extract specified stems like bass, drums, or vocals from uploaded songs.
- **Download Stems**: Download the processed stems directly to your local directory.

## Getting Started

### Prerequisites

- Node.js
- NestJS
- An API key for the FADR API

### Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/AudioStemExtractor.git
cd AudioStemExtractor
