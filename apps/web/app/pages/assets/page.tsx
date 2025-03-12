"use client";

import { useState } from 'react';
import { Button } from "@repo/ui/button";
import styles from './page.module.css';

type AssetType = 'stock' | 'other';

interface Asset {
  id: string;
  assetType: AssetType;
  assetName: string;
  winRate: number;
  amount: number;
  stockQuantity?: number;
  stockPrice?: number;
}

export default function AssetsPage() {
  const [assetType, setAssetType] = useState<AssetType>('other');
  const [winRate, setWinRate] = useState('');
  const [amount, setAmount] = useState('');
  const [assetName, setAssetName] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockPrice, setStockPrice] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAsset: Asset = {
      id: Date.now().toString(),
      assetType,
      assetName,
      winRate: Number(winRate),
      amount: assetType === 'stock' ? Number(stockQuantity) * Number(stockPrice) : Number(amount),
      ...(assetType === 'stock' && {
        stockQuantity: Number(stockQuantity),
        stockPrice: Number(stockPrice),
      }),
    };
    
    setAssets([...assets, newAsset]);
    
    // Reset form
    setAssetName('');
    setWinRate('');
    setAmount('');
    setStockQuantity('');
    setStockPrice('');
  };

  const calculateAmount = () => {
    if (assetType === 'stock' && stockQuantity && stockPrice) {
      const total = Number(stockQuantity) * Number(stockPrice);
      setAmount(total.toString());
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Left side - Form */}
      <div className={styles.formSection}>
        <h1 className={styles.title}>添加资产</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="assetType">资产类型:</label>
            <select
              id="assetType"
              value={assetType}
              onChange={(e) => setAssetType(e.target.value as AssetType)}
              required
            >
              <option value="other">其他</option>
              <option value="stock">股票</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="assetName">资产名:</label>
            <input
              type="text"
              id="assetName"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="winRate">资产胜率 (%):</label>
            <input
              type="number"
              id="winRate"
              value={winRate}
              onChange={(e) => setWinRate(e.target.value)}
              min="0"
              max="100"
              required
            />
          </div>

          {assetType === 'stock' ? (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="stockQuantity">股票数量:</label>
                <input
                  type="number"
                  id="stockQuantity"
                  value={stockQuantity}
                  onChange={(e) => {
                    setStockQuantity(e.target.value);
                    calculateAmount();
                  }}
                  min="0"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="stockPrice">股票单价:</label>
                <input
                  type="number"
                  id="stockPrice"
                  value={stockPrice}
                  onChange={(e) => {
                    setStockPrice(e.target.value);
                    calculateAmount();
                  }}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </>
          ) : (
            <div className={styles.formGroup}>
              <label htmlFor="amount">资产金额:</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>
          )}

          {assetType === 'stock' && (
            <div className={styles.formGroup}>
              <label>计算后的资产金额:</label>
              <div className={styles.calculatedAmount}>
                {Number(stockQuantity || 0) * Number(stockPrice || 0)}
              </div>
            </div>
          )}

          <Button appName="web" className={styles.submitButton}>
            提交
          </Button>
        </form>
      </div>

      {/* Right side - Asset List */}
      <div className={styles.listSection}>
        <h2 className={styles.subtitle}>资产列表</h2>
        <div className={styles.assetList}>
          {assets.map((asset) => (
            <div key={asset.id} className={styles.assetCard}>
              <h3 className={styles.assetName}>{asset.assetName}</h3>
              <div className={styles.assetDetails}>
                <p>类型: {asset.assetType === 'stock' ? '股票' : '其他'}</p>
                <p>胜率: {asset.winRate}%</p>
                <p>金额: ¥{asset.amount.toFixed(2)}</p>
                {asset.assetType === 'stock' && (
                  <>
                    <p>数量: {asset.stockQuantity}</p>
                    <p>单价: ¥{asset.stockPrice?.toFixed(2)}</p>
                  </>
                )}
              </div>
            </div>
          ))}
          {assets.length === 0 && (
            <div className={styles.emptyState}>
              暂无资产，请添加新的资产。
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 