import axios from 'axios';

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;

export const uploadFileToIPFS = async (file: File) => {
    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
        throw new Error("Pinata API keys are missing in .env.local");
    }

    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    let data = new FormData();
    data.append('file', file);

    const res = await axios.post(url, data, {
        headers: {
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_SECRET_API_KEY,
            "Content-Type": `multipart/form-data`,
        }
    });

    return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
};

export const uploadJSONToIPFS = async (metadata: object) => {
    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
        throw new Error("Pinata API keys are missing in .env.local");
    }

    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

    const res = await axios.post(url, metadata, {
        headers: {
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_SECRET_API_KEY,
        }
    });

    return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
};
