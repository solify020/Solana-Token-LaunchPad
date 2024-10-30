import React, { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  SystemProgram,
  Transaction,
  PublicKey,
} from "@solana/web3.js";
import {
  createInitializeMint2Instruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";

// Constants
const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
import initialFormData from "../utils";
const TokenLaunchPad = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { connection } = useConnection();
  const wallet = useWallet();
  const [mintKeypair, setMintKeypair] = useState(null);
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!wallet.connected) {
      setError("Please connect your wallet first");
      setLoading(false);
      return;
    }

    try {
      const mintPair = Keypair.generate();
      setMintKeypair(mintPair);
      const metadata = {
        mint: mintKeypair.publicKey,
        name: `${formData.name}`,
        description: `${formData.description}`,
        symbol: `${formData.symbol}`,
        uri: `${formData.image}`,
        additionalMetadata: [],
      };
      const lamports = await getMinimumBalanceForRentExemptMint(connection);

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mintKeyPair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMint2Instruction(
          mintKeyPair.publicKey,
          9,
          wallet.publicKey,
          wallet.publicKey,
          TOKEN_PROGRAM_ID
        )
      );

      const metadataAccount = (
        await PublicKey.findProgramAddress(
          [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mintKeyPair.publicKey.toBuffer(),
          ],
          TOKEN_METADATA_PROGRAM_ID
        )
      )[0];

      const metadataInstruction = createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataAccount,
          mint: mintKeyPair.publicKey,
          mintAuthority: wallet.publicKey,
          payer: wallet.publicKey,
          updateAuthority: wallet.publicKey,
        },
        {
          createMetadataAccountArgsV3: {
            data: {
              name: formData.name,
              symbol: formData.symbol,
              uri: formData.image,
              sellerFeeBasisPoints: 0,
              creators: null,
              collection: null,
              uses: null,
            },
            isMutable: true,
            collectionDetails: null,
          },
        }
      );

      transaction.add(metadataInstruction);
      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      transaction.partialSign(mintKeyPair);

      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);

      setSuccess(`Token mint created at ${mintKeyPair.publicKey.toBase58()}`);
      setFormData(initialFormData);
    } catch (error) {
      console.error("Error creating token:", error);
      setError(error.message || "Error creating token. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!wallet.connected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-4 rounded">
          Please connect your wallet to create a token
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Solana Token LaunchPad
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key}>
              <label htmlFor={key} className="block text-sm font-medium mb-1">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              <input
                id={key}
                name={key}
                value={value}
                placeholder={`Enter ${key}`}
                required
                onChange={(e) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    [e.target.name]: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading || !wallet.connected}
            className="w-full bg-blue-500 text-white p-2 rounded disabled:bg-gray-300"
          >
            {loading ? "Creating..." : "Create Token"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TokenLaunchPad;
