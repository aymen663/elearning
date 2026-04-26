"use client";
import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

// ── Materials ──
const materials = {
  whiteSquare: new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.7, metalness: 0.1 }),
  blackSquare: new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.8, metalness: 0.1 }),
  boardBase: new THREE.MeshStandardMaterial({ color: '#291b13', roughness: 0.9 }), 
  whitePiece: new THREE.MeshPhysicalMaterial({ color: '#f8fafc', roughness: 0.15, metalness: 0.1, clearcoat: 1.0, clearcoatRoughness: 0.1 }), 
  blackPiece: new THREE.MeshPhysicalMaterial({ color: '#111827', roughness: 0.2, metalness: 0.4, clearcoat: 0.8, clearcoatRoughness: 0.2 }), 
  highlight: new THREE.MeshStandardMaterial({ color: '#eab308', transparent: true, opacity: 0.6 }),
  validMove: new THREE.MeshStandardMaterial({ color: '#22c55e', transparent: true, opacity: 0.4 }),
  captureMove: new THREE.MeshStandardMaterial({ color: '#ef4444', transparent: true, opacity: 0.6 })
};

// ── Procedural Pieces ──
function Piece({ type, color, position, isSelected }) {
  const meshRef = useRef();
  
  const yOffset = type === 'king' ? 1.1 : type === 'queen' ? 1.0 : type === 'bishop' ? 0.8 : type === 'knight' ? 0.7 : type === 'rook' ? 0.6 : 0.5;
  const targetPos = useMemo(() => new THREE.Vector3(position[0], yOffset, position[2]), [position, yOffset]);
  
  // Fix color condition: piece.color is 'white' or 'black'
  const mat = color === 'white' ? materials.whitePiece : materials.blackPiece;

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.lerp(targetPos, delta * 10);
      if (isSelected) {
        meshRef.current.position.y = targetPos.y + 0.4 + Math.sin(state.clock.elapsedTime * 6) * 0.05;
      } else {
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetPos.y, delta * 10);
      }
    }
  });

  const topY = type === 'pawn' ? 0.4 : type === 'rook' ? 0.5 : type === 'bishop' ? 0.7 : type === 'queen' ? 0.9 : type === 'king' ? 1.0 : type === 'knight' ? 0.6 : 0;

  // Render proper meshes based on piece type
  return (
    <group ref={meshRef} position={[position[0], yOffset, position[2]]}>
      {/* Main Body */}
      {type === 'pawn' && <mesh castShadow receiveShadow material={mat}><cylinderGeometry args={[0.2, 0.4, 0.8, 32]} /></mesh>}
      {type === 'rook' && <mesh castShadow receiveShadow material={mat}><cylinderGeometry args={[0.35, 0.45, 1.0, 32]} /></mesh>}
      {type === 'knight' && <mesh castShadow receiveShadow material={mat}><cylinderGeometry args={[0.25, 0.45, 1.2, 32]} /></mesh>}
      {type === 'bishop' && <mesh castShadow receiveShadow material={mat}><coneGeometry args={[0.35, 1.4, 32]} /></mesh>}
      {type === 'queen' && <mesh castShadow receiveShadow material={mat}><cylinderGeometry args={[0.3, 0.5, 1.8, 32]} /></mesh>}
      {type === 'king' && <mesh castShadow receiveShadow material={mat}><cylinderGeometry args={[0.25, 0.5, 2.0, 32]} /></mesh>}
      
      {/* Fallback just in case */}
      {!['pawn','rook','knight','bishop','queen','king'].includes(type) && <mesh castShadow receiveShadow material={mat}><boxGeometry args={[0.5, 0.5, 0.5]} /></mesh>}

      {/* Top Details */}
      {type === 'pawn' && <mesh castShadow receiveShadow position={[0, topY, 0]} material={mat}><sphereGeometry args={[0.25, 32, 32]} /></mesh>}
      {type === 'rook' && <mesh castShadow receiveShadow position={[0, topY, 0]} material={mat}><cylinderGeometry args={[0.45, 0.4, 0.2, 8]} /></mesh>}
      {type === 'bishop' && <mesh castShadow receiveShadow position={[0, topY, 0]} material={mat}><sphereGeometry args={[0.15, 32, 32]} /></mesh>}
      {type === 'queen' && <mesh castShadow receiveShadow position={[0, topY, 0]} material={mat}><sphereGeometry args={[0.2, 32, 32]} /></mesh>}
      {type === 'king' && (
        <group position={[0, topY, 0]}>
          <mesh castShadow receiveShadow material={mat}><boxGeometry args={[0.15, 0.4, 0.1]} /></mesh>
          <mesh castShadow receiveShadow material={mat}><boxGeometry args={[0.3, 0.1, 0.1]} /></mesh>
        </group>
      )}

      {/* Base */}
      <mesh castShadow receiveShadow position={[0, -yOffset + 0.1, 0]} material={mat}>
        <cylinderGeometry args={[0.45, 0.5, 0.2, 32]} />
      </mesh>
    </group>
  );
}

// ── The 3D Board ──
function Board({ board, selected, validMoves, onSquareClick }) {
  const isSelected = (r, c) => selected?.[0] === r && selected?.[1] === c;
  const isValid = (r, c) => validMoves.some(([vr, vc]) => vr === r && vc === c);

  return (
    <group position={[0, 0, 0]}>
      <RoundedBox args={[8.4, 0.4, 8.4]} position={[0, -0.2, 0]} radius={0.05} smoothness={4} material={materials.boardBase} receiveShadow castShadow />
      
      {board.map((row, r) => 
        row.map((piece, c) => {
          const isLight = (r + c) % 2 === 0;
          const posX = c - 3.5;
          const posZ = r - 3.5;
          const sel = isSelected(r, c);
          const valid = isValid(r, c);
          const hasPiece = piece !== null;

          return (
            <group key={`${r}-${c}`} position={[posX, 0.01, posZ]}>
              <mesh 
                receiveShadow
                position={[0, 0, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                onClick={(e) => { e.stopPropagation(); onSquareClick(r, c); }}
                onPointerOver={() => document.body.style.cursor = 'pointer'}
                onPointerOut={() => document.body.style.cursor = 'default'}
                material={isLight ? materials.whiteSquare : materials.blackSquare}
              >
                <planeGeometry args={[1, 1]} />
              </mesh>

              {sel && (
                <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.highlight}>
                  <planeGeometry args={[1, 1]} />
                </mesh>
              )}
              {valid && (
                <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} material={hasPiece ? materials.captureMove : materials.validMove}>
                  <circleGeometry args={[hasPiece ? 0.4 : 0.2, 32]} />
                </mesh>
              )}

              {piece && (
                <Piece 
                  type={piece.type} 
                  color={piece.color} 
                  position={[0, 0, 0]} 
                  isSelected={sel}
                />
              )}
            </group>
          );
        })
      )}
    </group>
  );
}

// ── Main Canvas Component ──
export default function ChessGame3D({ board, selected, validMoves, handleClick, aiThinking }) {
  return (
    <div style={{ 
      width: '560px', 
      height: '560px', 
      borderRadius: '16px', 
      overflow: 'hidden', 
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 0 0 1px rgba(255,255,255,0.1)',
      background: '#0B0E14',
      opacity: aiThinking ? 0.8 : 1,
      pointerEvents: aiThinking ? 'none' : 'auto',
      transition: 'opacity 0.3s'
    }}>
      <Canvas shadows camera={{ position: [0, 7, 9], fov: 40 }}>
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[5, 10, 5]} 
          castShadow 
          intensity={0.8} 
          shadow-mapSize={[1024, 1024]} 
          shadow-bias={-0.0001}
        />
        
        {/* Soft studio environment instead of super bright preset */}
        <Environment preset="city" environmentIntensity={0.3} />

        <Board board={board} selected={selected} validMoves={validMoves} onSquareClick={handleClick} />

        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 6} 
          maxPolarAngle={Math.PI / 2.5} 
          minDistance={8}
          maxDistance={14}
        />
        
        <ContactShadows position={[0, -0.21, 0]} opacity={0.5} scale={10} blur={2} far={4} />
      </Canvas>
    </div>
  );
}
