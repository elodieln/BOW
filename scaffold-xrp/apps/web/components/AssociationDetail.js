"use client";

import { useEffect, useState } from "react";
import { AssociationNFTCard } from "./AssociationNFTCard";
import { DonationForm } from "./DonationForm";
import { useWallet } from "./providers/WalletProvider";
import Link from "next/link";

export default function AssociationDetail({ associationId }) {
  const [association, setAssociation] = useState(null);
  const [nftActions, setNftActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { accountInfo } = useWallet();
  
  // CORRECTION 1 : Initialiser à 0 pour éviter le crash (car association est null au début)
  const [totalRaised, setTotalRaised] = useState(0);

  // CORRECTION 2 : Sortir cette fonction du useEffect pour qu'elle soit accessible dans le return
  const handleDonationSuccess = (amountAdded) => {
    console.log("Mise à jour du total : +", amountAdded);
    setTotalRaised((prev) => prev + Number(amountAdded));
    console.log("Nouveau total après don :", totalRaised + Number(amountAdded));
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/associations/${associationId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }
        const data = await res.json();
        
        setAssociation(data);
        setNftActions(data.nftActions || []);
        
        // CORRECTION 3 : Mettre à jour le state du total une fois les données reçues
        // Assurez-vous que votre API renvoie bien 'totalFundsReceived' ou 'totalRaised'
        setTotalRaised(data.totalFundsReceived || 0);
        
      } catch (e) {
        console.error("Failed to load association detail:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [associationId]);

  if (loading) return <div>Chargement…</div>;
  if (error) return <div className="text-red-600">Erreur: {error}</div>;
  if (!association) return <div>Association non trouvée</div>;

  const isOwner = accountInfo && accountInfo.address === association.ownerAddress;
  const validatedActions = nftActions.filter((n) => n.status === "validated");
  const totalScore = validatedActions.length * 50;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/associations" className="text-accent font-medium">
          ← Retour à la liste
        </Link>
      </div>

      <div className="p-6 border-2 border-purple-300 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <h1 className="text-3xl font-bold mb-2">{association.name}</h1>
        <p className="text-gray-600 mb-4">{association.city}, {association.country}</p>
        <p className="text-gray-700 mb-4">{association.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {/* ... autres stats ... */}
          <div className="p-3 bg-white rounded-lg">
            <p className="text-xs text-gray-500">Niveau</p>
            <p className="text-2xl font-bold text-accent">{association.level}</p>
          </div>
          <div className="p-3 bg-white rounded-lg">
            <p className="text-xs text-gray-500">Quota XRP</p>
            <p className="text-2xl font-bold text-accent">{association.levelQuota}</p>
          </div>

          <div className="p-3 bg-white rounded-lg border-4 border-green-400">
            <p className="text-xs text-gray-500 font-bold">Total Donné</p>
            {/* CORRECTION 4 : Afficher la variable d'état dynamique 'totalRaised', pas la donnée statique */}
            <p className="text-3xl font-bold text-green-600">
              {totalRaised} 
            </p>
            <p className="text-xs text-gray-500">XRP</p>
          </div>

          {/* ... suite des stats ... */}
          <div className="p-3 bg-white rounded-lg">
            <p className="text-xs text-gray-500">Actions validées</p>
            <p className="text-2xl font-bold text-green-600">{validatedActions.length}</p>
          </div>
          <div className="p-3 bg-white rounded-lg border-4 border-yellow-400">
             <p className="text-xs text-gray-500 font-bold">SCORE NFT</p>
             <p className="text-3xl font-bold text-yellow-600">{totalScore}</p>
             <p className="text-xs text-gray-500">pts</p>
           </div>
        </div>
        
        {/* ... infos adresse ... */}
         <div className="text-sm text-gray-600 space-y-1 border-t pt-3">
          <p><strong>Adresse propriétaire:</strong> <code className="text-xs bg-gray-100 px-1">{association.ownerAddress}</code></p>
          <p><strong>Adresse de réception:</strong> <code className="text-xs bg-gray-100 px-1">{association.receivingAddress}</code></p>
        </div>
      </div>

      {/* ... Liste des actions NFT (code inchangé) ... */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Actions menées ({validatedActions.length} validées)</h2>
        {/* ... (votre map ici) ... */}
        {validatedActions.length === 0 ? (
          <p className="text-gray-500">Aucune action validée pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {validatedActions.map((nft) => (
              <AssociationNFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        )}
      </div>

      {/* Donation Form */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Soutenir cette association</h2>
        
        {/* CORRECTION 5 : Passer la fonction handleDonationSuccess en prop */}
        <DonationForm
          associationId={associationId}
          associationQuota={association.levelQuota}
          receivingAddress={association.receivingAddress}
          onDonationSuccess={handleDonationSuccess}
        />
      </div>

      {/* ... CreateNFTForm (inchangé) ... */}
      {isOwner && (
        <div className="p-4 bg-white border rounded">
          <h3 className="font-semibold">Espace association — créer une NFT Action</h3>
          <CreateNFTForm associationId={association.id} />
        </div>
      )}
    </div>
  );
}

// ... CreateNFTForm function reste inchangée
function CreateNFTForm({ associationId }) {
    // ... votre code existant pour le formulaire de création
    return <div>{/*...*/}</div>
}