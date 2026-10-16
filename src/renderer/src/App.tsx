import React, { useState, useEffect, useRef } from 'react'
import { 
  Package, ShoppingCart, ArrowLeftRight, Users, 
  DollarSign, BarChart3, 
  FileText, Receipt, TrendingUp, TrendingDown, Wallet, Vault, 
  ArrowDownLeft, ArrowUpRight, CheckCircle2, X, Search, UserCheck, Truck, Edit, History, ArrowLeft, Landmark,
  Download, Upload, ShieldCheck, Database, Plus, Trash2, RotateCcw
} from 'lucide-react'

interface CartItem {
  product: any
  qty: number
  unitPriceSYP: number
  totalSYP: number
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'vouchers' | 'customers' | 'suppliers' | 'vault' | 'balance' | 'inventory' | 'sales' | 'purchases' | 'expenses' | 'reports' | 'backup' | 'rates'>('sales')
  
  // سعر الصرف
  const [exchangeRate, setExchangeRate] = useState<number>(() => {
    const saved = localStorage.getItem('rami_rate')
    return saved ? parseFloat(saved) : 15000
  })
  const [tempRate, setTempRate] = useState<string>('15000')

  // تكلفة جملة الوحدات
  const [unitWholesaleCost, setUnitWholesaleCost] = useState<string>(() => {
    const savedV2 = localStorage.getItem('rami_unit_cost_v2')
    if (savedV2) return savedV2
    return '1060000'
  })
  const unitPrice = (parseFloat(unitWholesaleCost) || 1060000) / 1000000 

  // الصندوق الافتتاحي
  const [openingBalance, setOpeningBalance] = useState<string>(() => {
    return localStorage.getItem('rami_opening_balance') || '0'
  })

  // تاريخ ووقت آخر نسخة احتياطية
  const [lastBackupTime, setLastBackupTime] = useState<string>(() => {
    return localStorage.getItem('rami_last_backup_time') || 'لم يتم بعد'
  })

  // محركات البحث
  const [customerSearch, setCustomerSearch] = useState('')
  const [supplierSearch, setSupplierSearch] = useState('')
  const [voucherSearch, setVoucherSearch] = useState('')
  const [posProductSearch, setPosProductSearch] = useState('')

  // 1. حسابات الزبائن
  const [customersList, setCustomersList] = useState<any[]>(() => {
    const saved = localStorage.getItem('rami_customers')
    return saved ? JSON.parse(saved) : []
  })
  const [cFormName, setCFormName] = useState('')
  const [cFormPhone, setCFormPhone] = useState('')
  const [cFormAmount, setCFormAmount] = useState('')
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<any>(null)

  // 2. حسابات الموردين
  const [suppliersList, setSuppliersList] = useState<any[]>(() => {
    const saved = localStorage.getItem('rami_suppliers')
    return saved ? JSON.parse(saved) : []
  })
  const [sFormName, setSFormName] = useState('')
  const [sFormPhone, setSFormPhone] = useState('')
  const [sFormAmount, setSFormAmount] = useState('')
  const [sFormCur, setSFormCur] = useState('USD')

  // 3. السندات المالية (قبض ودفع)
  const [voucherLogs, setVoucherLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('rami_vouchers')
    return saved ? JSON.parse(saved) : []
  })
  const [vFormType, setVFormType] = useState<'سند قبض' | 'سند دفع'>('سند قبض')
  const [vFormPartyId, setVFormPartyId] = useState('')
  const [vFormAmount, setVFormAmount] = useState('')
  const [vFormNote, setVFormNote] = useState('')

  // 4. تحويل الرصيد
  const [balanceOps, setBalanceOps] = useState<any[]>(() => {
    const saved = localStorage.getItem('rami_balance_ops')
    return saved ? JSON.parse(saved) : []
  })
  const [bPhone, setBPhone] = useState('')
  const [bCustomerName, setBCustomerName] = useState('')
  const [bType, setBType] = useState('سيريتل وحدات')
  const [bPaymentType, setBPaymentType] = useState<'نقدي' | 'آجل'>('نقدي')
  const [bUnits, setBUnits] = useState('')
  const [bAmount, setBAmount] = useState('')
  const [bDirectCost, setBDirectCost] = useState('')

  const isUnitsMode = bType.includes('وحدات')
  const calculatedCost = isUnitsMode 
    ? Math.round((parseFloat(bUnits) || 0) * unitPrice) 
    : (parseFloat(bDirectCost) || 0)
  const currentReceived = parseFloat(bAmount) || 0
  const calculatedProfit = currentReceived > 0 ? (currentReceived - calculatedCost) : 0
  const calculatedMargin = currentReceived > 0 ? ((calculatedProfit / currentReceived) * 100).toFixed(1) : '0'

  // نافذة تعديل الرصيد المستقلة والمباشرة
  const [balanceEditItem, setBalanceEditItem] = useState<any | null>(null)
  const [beCustomerName, setBeCustomerName] = useState('')
  const [bePhone, setBePhone] = useState('')
  const [beType, setBeType] = useState('سيريتل وحدات')
  const [bePaymentType, setBePaymentType] = useState<'نقدي' | 'آجل'>('نقدي')
  const [beUnits, setBeUnits] = useState('0')
  const [beCost, setBeCost] = useState('0')
  const [beAmount, setBeAmount] = useState('0')

  // 5. المخزون
  const [products, setProducts] = useState<any[]>(() => {
    const saved = localStorage.getItem('rami_products')
    return saved ? JSON.parse(saved) : []
  })
  const [pName, setPName] = useState('')
  const [pCat, setPCat] = useState('قطع صيانة')
  const [pCost, setPCost] = useState('')
  const [pCostCur, setPCostCur] = useState<'USD' | 'SYP'>('USD')
  const [pSell, setPSell] = useState('')
  const [pSellCur, setPSellCur] = useState<'USD' | 'SYP'>('SYP')
  const [pQty, setPQty] = useState('')
  const [pAlert, setPAlert] = useState('2')

  // 6. فواتير المبيعات وسلة البيع المتعددة
  const [salesList, setSalesList] = useState<any[]>(() => {
    const saved = localStorage.getItem('rami_sales')
    return saved ? JSON.parse(saved) : []
  })
  const [cart, setCart] = useState<CartItem[]>([])
  const [saleCustomer, setSaleCustomer] = useState('')
  const [saleType, setSaleType] = useState<'نقدي' | 'آجل'>('نقدي')

  // 7. فواتير الشراء والتوريد
  const [purchasesList, setPurchasesList] = useState<any[]>(() => {
    const saved = localStorage.getItem('rami_purchases')
    return saved ? JSON.parse(saved) : []
  })
  const [purSupplier, setPurSupplier] = useState('')
  const [purTotal, setPurTotal] = useState('')
  const [purCur, setPurCur] = useState('USD')

  // 8. مصاريف المحل
  const [expenses, setExpenses] = useState<any[]>(() => {
    const saved = localStorage.getItem('rami_expenses')
    return saved ? JSON.parse(saved) : []
  })
  const [expTitle, setExpTitle] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [expCur, setExpCur] = useState('SYP')
  const [expNote, setExpNote] = useState('')

  // نافذة التعديل لبقية الأقسام
  const [editModal, setEditModal] = useState<{
    type: string | null,
    item: any
  }>({ type: null, item: null })
  const [editFields, setEditFields] = useState<any>({})

  const fileInputRef = useRef<HTMLInputElement>(null)

  // الحفظ التلقائي في localStorage
  useEffect(() => { localStorage.setItem('rami_customers', JSON.stringify(customersList)) }, [customersList])
  useEffect(() => { localStorage.setItem('rami_suppliers', JSON.stringify(suppliersList)) }, [suppliersList])
  useEffect(() => { localStorage.setItem('rami_vouchers', JSON.stringify(voucherLogs)) }, [voucherLogs])
  useEffect(() => { localStorage.setItem('rami_balance_ops', JSON.stringify(balanceOps)) }, [balanceOps])
  useEffect(() => { localStorage.setItem('rami_products', JSON.stringify(products)) }, [products])
  useEffect(() => { localStorage.setItem('rami_sales', JSON.stringify(salesList)) }, [salesList])
  useEffect(() => { localStorage.setItem('rami_purchases', JSON.stringify(purchasesList)) }, [purchasesList])
  useEffect(() => { localStorage.setItem('rami_expenses', JSON.stringify(expenses)) }, [expenses])
  useEffect(() => { localStorage.setItem('rami_rate', String(exchangeRate)) }, [exchangeRate])
  useEffect(() => { localStorage.setItem('rami_unit_cost_v2', unitWholesaleCost) }, [unitWholesaleCost])
  useEffect(() => { localStorage.setItem('rami_opening_balance', openingBalance) }, [openingBalance])

  useEffect(() => {
    const now = new Date().toLocaleString('ar-SY', { dateStyle: 'short', timeStyle: 'short' })
    setLastBackupTime(now)
    localStorage.setItem('rami_last_backup_time', now)
  }, [customersList, suppliersList, voucherLogs, balanceOps, products, salesList, purchasesList, expenses])

  // فتح نافذة تعديل الرصيد
  const openBalanceEdit = (op: any) => {
    setBalanceEditItem(op)
    setBeCustomerName(op.customerName || '')
    setBePhone(op.phone || '')
    setBeType(op.type || 'سيريتل وحدات')
    setBePaymentType(op.paymentType || 'نقدي')
    setBeUnits(String(op.units || 0))
    setBeCost(String(op.cost || 0))
    setBeAmount(String(op.amount || 0))
  }

  // حفظ تعديل الرصيد
  const handleSaveBalanceEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!balanceEditItem) return

    const units = parseInt(beUnits) || 0
    const amt = parseFloat(beAmount) || 0
    const isUnits = beType.includes('وحدات') || units > 0
    const cst = isUnits ? Math.round(units * unitPrice) : (parseFloat(beCost) || 0)
    const prof = amt - cst
    const mrg = amt > 0 ? ((prof / amt) * 100).toFixed(1) : '0'

    if (balanceEditItem.paymentType === 'آجل' || bePaymentType === 'آجل') {
      const oldAmt = balanceEditItem.paymentType === 'آجل' ? (balanceEditItem.amount || 0) : 0
      const newCreditAmt = bePaymentType === 'آجل' ? amt : 0
      const diff = newCreditAmt - oldAmt
      setCustomersList(customersList.map(c => {
        if (c.name.trim().toLowerCase() === beCustomerName.trim().toLowerCase()) {
          return { ...c, debtSYP: Math.max(0, c.debtSYP + diff) }
        }
        return c
      }))
    }

    setBalanceOps(balanceOps.map(b => b.id === balanceEditItem.id ? {
      ...b,
      phone: bePhone,
      customerName: beCustomerName,
      type: beType,
      paymentType: bePaymentType,
      units,
      amount: amt,
      cost: cst,
      profit: prof,
      margin: parseFloat(mrg)
    } : b))

    setBalanceEditItem(null)
  }

  // سلة المبيعات
  const addToCart = (product: any) => {
    const sellPriceSYP = product.sellCur === 'USD' 
      ? Math.round(product.sellUSD * exchangeRate) 
      : (product.sellSYP || Math.round((product.sellUSD || 0) * exchangeRate))

    const existingIndex = cart.findIndex(item => item.product.id === product.id)
    if (existingIndex !== -1) {
      const updatedCart = [...cart]
      updatedCart[existingIndex].qty += 1
      updatedCart[existingIndex].totalSYP = updatedCart[existingIndex].qty * sellPriceSYP
      setCart(updatedCart)
    } else {
      setCart([...cart, {
        product,
        qty: 1,
        unitPriceSYP: sellPriceSYP,
        totalSYP: sellPriceSYP
      }])
    }
    setPosProductSearch('')
  }

  const updateCartQty = (productId: number, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId)
      return
    }
    setCart(cart.map(item => item.product.id === productId ? {
      ...item,
      qty: newQty,
      totalSYP: newQty * item.unitPriceSYP
    } : item))
  }

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  const cartTotalSYP = cart.reduce((acc, item) => acc + item.totalSYP, 0)
  const cartTotalCostSYP = cart.reduce((acc, item) => {
    const costSYP = (item.product.costUSD || 0) * exchangeRate
    return acc + (costSYP * item.qty)
  }, 0)
  const cartProfitSYP = Math.max(0, cartTotalSYP - cartTotalCostSYP)

  // تأكيد وحفظ الفاتورة
  const handleCheckoutSale = (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) return

    const cName = saleCustomer.trim() || 'زبون نقدي عام'
    const nowISO = new Date().toISOString()

    const newInvoice = {
      id: 'INV-' + Math.floor(1000 + Math.random() * 9000),
      customer: cName,
      items: cart.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        qty: i.qty,
        unitPriceSYP: i.unitPriceSYP,
        totalSYP: i.totalSYP,
        costUSD: i.product.costUSD || 0
      })),
      totalSYP: cartTotalSYP,
      profitSYP: cartProfitSYP,
      type: saleType,
      date: nowISO.split('T')[0],
      createdAt: nowISO
    }

    const updatedProducts = products.map(p => {
      const cartItem = cart.find(ci => ci.product.id === p.id)
      return cartItem ? { ...p, qty: Math.max(0, p.qty - cartItem.qty) } : p
    })
    setProducts(updatedProducts)

    if (saleType === 'آجل' && cartTotalSYP > 0) {
      const existingIdx = customersList.findIndex(c => c.name.trim().toLowerCase() === cName.toLowerCase())
      if (existingIdx !== -1) {
        const updated = [...customersList]
        updated[existingIdx].debtSYP += cartTotalSYP
        setCustomersList(updated)
      } else {
        setCustomersList([{ id: Date.now(), name: cName, phone: '', debtSYP: cartTotalSYP }, ...customersList])
      }
    }

    setSalesList([newInvoice, ...salesList])
    setCart([])
    setSaleCustomer('')
  }

  // تطبيع عناصر الفواتير القديمة والجديدة
  const normalizeSaleItems = (sale: any, productsList: any[]) => {
    if (Array.isArray(sale.items) && sale.items.length > 0) {
      return sale.items.map((it: any) => {
        const matchedProduct = productsList.find(p => p.id === it.productId)
          || productsList.find(p => p.name === it.productName)
        return {
          productId: matchedProduct ? matchedProduct.id : (it.productId ?? null),
          productName: it.productName || (matchedProduct ? matchedProduct.name : 'مادة غير معروفة'),
          qty: it.qty || 1,
          unitPriceSYP: it.unitPriceSYP || (it.qty ? it.totalSYP / it.qty : 0),
          totalSYP: it.totalSYP || ((it.unitPriceSYP || 0) * (it.qty || 1)),
          costUSD: it.costUSD || (matchedProduct ? matchedProduct.costUSD : 0)
        }
      })
    }

    const qty = sale.qty || 1
    const totalSYP = sale.totalSYP || 0
    const matchedProduct = productsList.find(p => p.name === sale.productName)

    return [{
      productId: matchedProduct ? matchedProduct.id : null,
      productName: sale.productName || 'مادة غير مسمّاة',
      qty,
      unitPriceSYP: qty > 0 ? totalSYP / qty : totalSYP,
      totalSYP,
      costUSD: matchedProduct ? (matchedProduct.costUSD || 0) : 0
    }]
  }

  // عكس الأثر المالي والمخزني
  const reverseSaleEffects = (sale: any) => {
    const saleItems = normalizeSaleItems(sale, products)

    const revertedProducts = products.map(p => {
      const item = saleItems.find((i: any) => i.productId === p.id)
      return item ? { ...p, qty: p.qty + item.qty } : p
    })

    let revertedCustomers = customersList
    if (sale.type === 'آجل') {
      revertedCustomers = customersList.map(c => {
        if (c.name.trim().toLowerCase() === sale.customer.trim().toLowerCase()) {
          return { ...c, debtSYP: Math.max(0, c.debtSYP - sale.totalSYP) }
        }
        return c
      })
    }

    return { revertedProducts, revertedCustomers }
  }

  const handleDeleteSale = (saleId: string) => {
    const sale = salesList.find(s => s.id === saleId)
    if (!sale) return

    if (confirm(`هل أنت متأكد من إلغاء الفاتورة ${saleId}؟ سيتم إرجاع المواد للمخزون وتصحيح الحسابات فوراً.`)) {
      const { revertedProducts, revertedCustomers } = reverseSaleEffects(sale)
      setProducts(revertedProducts)
      setCustomersList(revertedCustomers)
      setSalesList(salesList.filter(s => s.id !== saleId))
    }
  }

  const handleReloadSaleToCart = (saleId: string) => {
    const sale = salesList.find(s => s.id === saleId)
    if (!sale) return

    if (confirm(`سيتم تفريغ السلة الحالية وتحميل مواد الفاتورة ${saleId} لإعادة تعديلها وعكس قيدها القديم. متابعة؟`)) {
      const saleItems = normalizeSaleItems(sale, products)
      const { revertedProducts, revertedCustomers } = reverseSaleEffects(sale)

      setProducts(revertedProducts)
      setCustomersList(revertedCustomers)
      setSalesList(salesList.filter(s => s.id !== saleId))

      const reloadedCart: CartItem[] = saleItems.map((it) => {
        const prod = revertedProducts.find(p => p.id === it.productId) || {
          id: it.productId || Date.now(),
          name: it.productName,
          costUSD: it.costUSD || 0,
          qty: it.qty,
          category: 'غير مصنف',
          sellSYP: it.unitPriceSYP,
          sellUSD: 0,
          sellCur: 'SYP',
          costSYP: 0,
          minAlert: 2
        }
        return {
          product: prod,
          qty: it.qty,
          unitPriceSYP: it.unitPriceSYP,
          totalSYP: it.totalSYP
        }
      })

      setCart(reloadedCart)
      setSaleCustomer(sale.customer)
      setSaleType(sale.type)
      setActiveTab('sales')
    }
  }

  // تصدير واسترجاع النسخ الاحتياطية
  const handleExportBackup = () => {
    const allData = {
      system: 'RAMI_TELECOM_POS',
      version: '3.6.0',
      exportDate: new Date().toISOString(),
      exchangeRate,
      unitWholesaleCost,
      openingBalance,
      customersList,
      suppliersList,
      voucherLogs,
      balanceOps,
      products,
      salesList,
      purchasesList,
      expenses
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allData, null, 2))
    const downloadAnchor = document.createElement('a')
    const fileName = `RamiTelecom_Backup_${new Date().toISOString().split('T')[0]}.json`
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', fileName)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()

    const now = new Date().toLocaleString('ar-SY', { dateStyle: 'short', timeStyle: 'short' })
    setLastBackupTime(now)
    localStorage.setItem('rami_last_backup_time', now)
    alert('تم تحميل النسخة الاحتياطية بنجاح!')
  }

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader()
    const files = e.target.files
    if (!files || files.length === 0) return

    fileReader.readAsText(files[0], 'UTF-8')
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        if (!parsed.system && !parsed.customersList) {
          throw new Error('ملف غير صالح')
        }

        if (confirm('تنبيه: سيتم استرجاع كافة البيانات واستبدال السجلات الحالية بنسخة الملف. هل تريد المتابعة؟')) {
          if (parsed.customersList) setCustomersList(parsed.customersList)
          if (parsed.suppliersList) setSuppliersList(parsed.suppliersList)
          if (parsed.voucherLogs) setVoucherLogs(parsed.voucherLogs)
          if (parsed.balanceOps) setBalanceOps(parsed.balanceOps)
          if (parsed.products) setProducts(parsed.products)
          if (parsed.salesList) setSalesList(parsed.salesList)
          if (parsed.purchasesList) setPurchasesList(parsed.purchasesList)
          if (parsed.expenses) setExpenses(parsed.expenses)
          if (parsed.exchangeRate) setExchangeRate(parsed.exchangeRate)
          if (parsed.unitWholesaleCost) {
            setUnitWholesaleCost(parsed.unitWholesaleCost)
            localStorage.setItem('rami_unit_cost_v2', parsed.unitWholesaleCost)
          }
          if (parsed.openingBalance) setOpeningBalance(parsed.openingBalance)

          const now = new Date().toLocaleString('ar-SY', { dateStyle: 'short', timeStyle: 'short' })
          setLastBackupTime(now)
          localStorage.setItem('rami_last_backup_time', now)

          alert('تم استرجاع النسخة الاحتياطية بنجاح تام!')
        }
      } catch {
        alert('حدث خطأ أثناء قراءة الملف.')
      }
    }
  }

  // فتح نافذة التعديل لبقية الأقسام
  const openEditModal = (type: any, item: any) => {
    setEditModal({ type: String(type), item })
    setEditFields({
      ...item,
      customer: item.customer || '',
      name: item.name || '',
      debtSYP: (item.debtSYP !== undefined && item.debtSYP !== null) ? String(item.debtSYP) : '0',
      debtUSD: (item.debtUSD !== undefined && item.debtUSD !== null) ? String(item.debtUSD) : '0',
      costUSD: (item.costUSD !== undefined && item.costUSD !== null) ? String(item.costUSD) : '0',
      sellSYP: (item.sellSYP !== undefined && item.sellSYP !== null) ? String(item.sellSYP) : '0',
      qty: (item.qty !== undefined && item.qty !== null) ? String(item.qty) : '1',
      totalSYP: (item.totalSYP !== undefined && item.totalSYP !== null) ? String(item.totalSYP) : '0',
      totalUSD: (item.totalUSD !== undefined && item.totalUSD !== null) ? String(item.totalUSD) : '0',
      supplier: item.supplier || '',
      title: item.title || '',
      note: item.note || ''
    })
  }

  // حفظ التعديل العام
  const handleSaveUniversalEdit = (e: React.FormEvent) => {
    e.preventDefault()
    const { type, item } = editModal
    if (!type || !item) return

    if (type === 'customer') {
      setCustomersList(customersList.map(c => c.id === item.id ? {
        ...c,
        name: editFields.name,
        phone: editFields.phone,
        debtSYP: parseFloat(editFields.debtSYP) || 0
      } : c))
    } 
    else if (type === 'supplier') {
      setSuppliersList(suppliersList.map(s => s.id === item.id ? {
        ...s,
        name: editFields.name,
        phone: editFields.phone,
        debtUSD: parseFloat(editFields.debtUSD) || 0,
        debtSYP: parseFloat(editFields.debtSYP) || 0
      } : s))
    }
    else if (type === 'voucher') {
      const oldAmt = item.amount
      const newAmt = parseFloat(editFields.amount) || 0
      const diff = newAmt - oldAmt

      if (item.type === 'سند قبض') {
        setCustomersList(customersList.map(c => {
          if (c.id === item.partyId || c.name === item.partyName) {
            return { ...c, debtSYP: Math.max(0, c.debtSYP - diff) }
          }
          return c
        }))
      } else {
        setSuppliersList(suppliersList.map(s => {
          if (s.id === item.partyId || s.name === item.partyName) {
            const isUSD = item.cur === 'USD'
            return {
              ...s,
              debtUSD: isUSD ? Math.max(0, s.debtUSD - diff) : s.debtUSD,
              debtSYP: !isUSD ? Math.max(0, s.debtSYP - diff) : s.debtSYP
            }
          }
          return s
        }))
      }

      setVoucherLogs(voucherLogs.map(v => v.id === item.id ? {
        ...v,
        amount: newAmt,
        note: editFields.note
      } : v))
    }
    else if (type === 'product') {
      setProducts(products.map(p => p.id === item.id ? {
        ...p,
        name: editFields.name,
        category: editFields.category,
        costUSD: parseFloat(editFields.costUSD) || 0,
        costSYP: parseFloat(editFields.costSYP) || 0,
        sellUSD: parseFloat(editFields.sellUSD) || 0,
        sellSYP: parseFloat(editFields.sellSYP) || 0,
        sellCur: editFields.sellCur || 'SYP',
        qty: parseInt(editFields.qty) || 0
      } : p))
    }
    else if (type === 'sale') {
      const newTotal = parseFloat(editFields.totalSYP) || 0
      const oldTotal = item.totalSYP || 0
      const diff = newTotal - oldTotal

      if (item.type === 'آجل') {
        setCustomersList(customersList.map(c => {
          if (c.name.trim().toLowerCase() === item.customer?.trim().toLowerCase()) {
            return { ...c, debtSYP: Math.max(0, c.debtSYP + diff) }
          }
          return c
        }))
      }

      setSalesList(salesList.map(s => s.id === item.id ? {
        ...s,
        customer: editFields.customer,
        totalSYP: newTotal,
        type: editFields.type
      } : s))
    }
    else if (type === 'purchase') {
      setPurchasesList(purchasesList.map(p => p.id === item.id ? {
        ...p,
        supplier: editFields.supplier,
        totalUSD: parseFloat(editFields.totalUSD) || 0
      } : p))
    }
    else if (type === 'expense') {
      setExpenses(expenses.map(ex => ex.id === item.id ? {
        ...ex,
        title: editFields.title,
        amount: parseFloat(editFields.amount) || 0,
        cur: editFields.cur,
        note: editFields.note
      } : ex))
    }

    setEditModal({ type: null, item: null })
  }

  // إضافة سند
  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(vFormAmount) || 0
    if (amt <= 0 || !vFormPartyId) return
    const nowISO = new Date().toISOString()

    if (vFormType === 'سند قبض') {
      const cust = customersList.find(c => String(c.id) === vFormPartyId)
      if (!cust) return

      setCustomersList(customersList.map(c => 
        c.id === cust.id ? { ...c, debtSYP: Math.max(0, c.debtSYP - amt) } : c
      ))

      const newVoucher = {
        id: Date.now(),
        voucherNumber: 'REC-' + Math.floor(1000 + Math.random() * 9000),
        type: 'سند قبض',
        partyId: cust.id,
        partyName: cust.name,
        amount: amt,
        cur: 'SYP',
        note: vFormNote || 'قبض نقدي من الزبون',
        date: nowISO.split('T')[0],
        createdAt: nowISO
      }
      setVoucherLogs([newVoucher, ...voucherLogs])
    } else {
      const supp = suppliersList.find(s => String(s.id) === vFormPartyId)
      if (!supp) return

      const isUSD = supp.debtUSD > 0
      setSuppliersList(suppliersList.map(s => {
        if (s.id === supp.id) {
          return {
            ...s,
            debtUSD: isUSD ? Math.max(0, s.debtUSD - amt) : 0,
            debtSYP: !isUSD ? Math.max(0, s.debtSYP - amt) : 0
          }
        }
        return s
      }))

      const newVoucher = {
        id: Date.now(),
        voucherNumber: 'PAY-' + Math.floor(1000 + Math.random() * 9000),
        type: 'سند دفع',
        partyId: supp.id,
        partyName: supp.name,
        amount: amt,
        cur: isUSD ? 'USD' : 'SYP',
        note: vFormNote || 'تسديد دفعة للمورد',
        date: nowISO.split('T')[0],
        createdAt: nowISO
      }
      setVoucherLogs([newVoucher, ...voucherLogs])
    }

    setVFormAmount('')
    setVFormNote('')
  }

  // إضافة زبون
  const handleAddOrUpdateCustomer = (e: React.FormEvent) => {
    e.preventDefault()
    const name = cFormName.trim()
    if (!name) return
    const amt = parseFloat(cFormAmount) || 0

    const existingIdx = customersList.findIndex(c => c.name.trim().toLowerCase() === name.toLowerCase())
    if (existingIdx !== -1) {
      const updated = [...customersList]
      updated[existingIdx].debtSYP += amt
      if (cFormPhone) updated[existingIdx].phone = cFormPhone
      setCustomersList(updated)
    } else {
      setCustomersList([{ id: Date.now(), name, phone: cFormPhone, debtSYP: amt }, ...customersList])
    }
    setCFormName(''); setCFormPhone(''); setCFormAmount('')
  }

  // إضافة مورد
  const handleAddOrUpdateSupplier = (e: React.FormEvent) => {
    e.preventDefault()
    const name = sFormName.trim()
    if (!name) return
    const amt = parseFloat(sFormAmount) || 0

    const existingIdx = suppliersList.findIndex(s => s.name.trim().toLowerCase() === name.toLowerCase())
    if (existingIdx !== -1) {
      const updated = [...suppliersList]
      if (sFormCur === 'USD') updated[existingIdx].debtUSD += amt
      else updated[existingIdx].debtSYP += amt
      if (sFormPhone) updated[existingIdx].phone = sFormPhone
      setSuppliersList(updated)
    } else {
      setSuppliersList([{ 
        id: Date.now(), 
        name, 
        phone: sFormPhone, 
        debtUSD: sFormCur === 'USD' ? amt : 0, 
        debtSYP: sFormCur === 'SYP' ? amt : 0 
      }, ...suppliersList])
    }
    setSFormName(''); setSFormPhone(''); setSFormAmount('')
  }

  // تحويل رصيد
  const addBalanceOp = (e: React.FormEvent) => {
    e.preventDefault()
    const received = parseFloat(bAmount) || 0
    if (received <= 0) return

    const custName = bCustomerName.trim() || 'زبون عام'
    const nowISO = new Date().toISOString()

    const newOp = {
      id: Date.now(),
      phone: bPhone || 'بدون رقم',
      customerName: custName,
      type: bType,
      paymentType: bPaymentType,
      units: isUnitsMode ? (parseInt(bUnits) || 0) : 0,
      amount: received,
      cost: calculatedCost,
      profit: calculatedProfit,
      margin: parseFloat(calculatedMargin) || 0,
      date: nowISO.split('T')[0],
      createdAt: nowISO
    }
    setBalanceOps([newOp, ...balanceOps])

    if (bPaymentType === 'آجل') {
      const existingIdx = customersList.findIndex(c => c.name.trim().toLowerCase() === custName.toLowerCase())
      if (existingIdx !== -1) {
        const updated = [...customersList]
        updated[existingIdx].debtSYP += received
        if (bPhone && !updated[existingIdx].phone) updated[existingIdx].phone = bPhone
        setCustomersList(updated)
      } else {
        setCustomersList([{ id: Date.now(), name: custName, phone: bPhone, debtSYP: received }, ...customersList])
      }
    }

    setBPhone(''); setBCustomerName(''); setBUnits(''); setBAmount(''); setBDirectCost('')
  }

  // إضافة مادة
  const addProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pName) return

    const rawCost = parseFloat(pCost) || 0
    const rawSell = parseFloat(pSell) || 0

    const costUSD = pCostCur === 'USD' ? rawCost : (rawCost / exchangeRate)
    const costSYP = pCostCur === 'SYP' ? rawCost : (rawCost * exchangeRate)
    const sellUSD = pSellCur === 'USD' ? rawSell : (rawSell / exchangeRate)
    const sellSYP = pSellCur === 'SYP' ? rawSell : (rawSell * exchangeRate)

    setProducts([{
      id: Date.now(),
      name: pName,
      category: pCat,
      costUSD,
      costSYP,
      costCur: pCostCur,
      sellUSD,
      sellSYP,
      sellCur: pSellCur,
      qty: parseInt(pQty) || 0,
      minAlert: parseInt(pAlert) || 2
    }, ...products])

    setPName(''); setPCost(''); setPSell(''); setPQty('')
  }

  // مشتريات
  const addPurchase = (e: React.FormEvent) => {
    e.preventDefault()
    const sName = purSupplier.trim()
    if (!sName) return

    setPurchasesList([{
      id: 'BILL-' + Math.floor(100 + Math.random() * 900),
      supplier: sName,
      totalUSD: parseFloat(purTotal) || 0,
      status: 'مدفوع نقداً',
      date: new Date().toISOString().split('T')[0]
    }, ...purchasesList])
    setPurSupplier(''); setPurTotal('')
  }

  // مصروف
  const addExpense = (e: React.FormEvent) => {
    e.preventDefault()
    if (!expTitle || !expAmount) return
    setExpenses([{
      id: Date.now(),
      title: expTitle,
      amount: parseFloat(expAmount) || 0,
      cur: expCur,
      date: new Date().toISOString().split('T')[0],
      note: expNote
    }, ...expenses])
    setExpTitle(''); setExpAmount(''); setExpNote('')
  }

  const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n)

  // الحسابات المالية للصندوق
  const cashFromReceiptVouchers = voucherLogs
    .filter(v => v.type === 'سند قبض')
    .reduce((acc, curr) => acc + (curr.cur === 'USD' ? curr.amount * exchangeRate : curr.amount), 0)

  const cashOutPaymentVouchers = voucherLogs
    .filter(v => v.type === 'سند دفع')
    .reduce((acc, curr) => acc + (curr.cur === 'USD' ? curr.amount * exchangeRate : curr.amount), 0)

  const cashFromSales = salesList.filter(s => s.type === 'نقدي').reduce((acc, curr) => acc + (curr.totalSYP || 0), 0)
  const cashFromBalance = balanceOps.filter(b => b.paymentType === 'نقدي').reduce((acc, curr) => acc + (curr.amount || 0), 0)
  const totalCashIn = cashFromSales + cashFromBalance + cashFromReceiptVouchers

  const totalExpensesSYP = expenses.reduce((acc, curr) => acc + (curr.cur === 'USD' ? curr.amount * exchangeRate : curr.amount), 0)
  const totalCashOut = totalExpensesSYP + cashOutPaymentVouchers

  const startBal = parseFloat(openingBalance) || 0
  const currentVaultCash = startBal + totalCashIn - totalCashOut

  const totalBalanceProfit = balanceOps.reduce((acc, curr) => acc + (curr.profit || 0), 0)
  const totalSalesProfit = salesList.reduce((acc, curr) => acc + (curr.profitSYP || 0), 0)
  const grossProfit = totalBalanceProfit + totalSalesProfit
  const netProfit = grossProfit - totalExpensesSYP

  const totalCustomerDebtsSYP = customersList.reduce((acc, curr) => acc + (curr.debtSYP || 0), 0)
  const totalSupplierDebtsSYP = suppliersList.reduce((acc, curr) => acc + ((curr.debtSYP || 0) + (curr.debtUSD * exchangeRate)), 0)

  const filteredCustomers = customersList.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
    (c.phone && c.phone.includes(customerSearch))
  )

  const filteredSuppliers = suppliersList.filter(s => 
    s.name.toLowerCase().includes(supplierSearch.toLowerCase()) || 
    (s.phone && s.phone.includes(supplierSearch))
  )

  const filteredVouchers = voucherLogs.filter(v => 
    v.voucherNumber.toLowerCase().includes(voucherSearch.toLowerCase()) ||
    v.partyName.toLowerCase().includes(voucherSearch.toLowerCase()) ||
    (v.note && v.note.toLowerCase().includes(voucherSearch.toLowerCase()))
  )

  const filteredProductsForPOS = products.filter(p => 
    p.name.toLowerCase().includes(posProductSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(posProductSearch.toLowerCase())
  )

  // كشف الحساب التراكمي للزبون
  const customerStatementEntries = selectedCustomerForHistory ? (() => {
    const custName = selectedCustomerForHistory.name.trim().toLowerCase()
    const entries: any[] = []

    salesList
      .filter(s => s.customer.trim().toLowerCase() === custName && s.type === 'آجل')
      .forEach(s => {
        entries.push({
          date: s.createdAt || `${s.date}T00:00:00.000Z`,
          type: 'فاتورة مبيع',
          description: s.items ? s.items.map((i: any) => `${i.productName} (${i.qty})`).join('، ') : (s.productName || 'مشتريات بضاعة'),
          debit: s.totalSYP,
          credit: 0
        })
      })

    balanceOps
      .filter(b => b.customerName && b.customerName.trim().toLowerCase() === custName && b.paymentType === 'آجل')
      .forEach(b => {
        entries.push({
          date: b.createdAt || `${b.date}T00:00:00.000Z`,
          type: 'تحويل رصيد',
          description: `${b.type} لرقم ${b.phone}`,
          debit: b.amount,
          credit: 0
        })
      })

    voucherLogs
      .filter(v => v.type === 'سند قبض' && (v.partyId === selectedCustomerForHistory.id || v.partyName.trim().toLowerCase() === custName))
      .forEach(v => {
        entries.push({
          date: v.createdAt || `${v.date}T00:00:00.000Z`,
          type: 'سند قبض',
          description: v.note || 'دفعة نقدية مسددة',
          debit: 0,
          credit: v.amount
        })
      })

    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    let running = 0
    return entries.map(e => {
      running += (e.debit - e.credit)
      return { ...e, runningBalance: running }
    })
  })() : []

  // دالة رندر حقول التعديل لبقية النوافذ
  const renderEditFields = () => {
    switch (editModal.type) {
      case 'customer':
        return (
          <>
            <div><label className="block text-xs text-slate-400 mb-1">اسم الزبون</label><input type="text" value={editFields.name || ''} onChange={e => setEditFields({...editFields, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white outline-none" required /></div>
            <div><label className="block text-xs text-slate-400 mb-1">الهاتف</label><input type="text" value={editFields.phone || ''} onChange={e => setEditFields({...editFields, phone: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white font-mono outline-none" /></div>
            <div><label className="block text-xs text-slate-400 mb-1">المبلغ المتبقي بذمته</label><input type="text" value={editFields.debtSYP || ''} onChange={e => setEditFields({...editFields, debtSYP: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-base font-mono font-bold text-amber-400 outline-none" required /></div>
          </>
        )

      case 'supplier':
        return (
          <>
            <div><label className="block text-xs text-slate-400 mb-1">اسم المورد</label><input type="text" value={editFields.name || ''} onChange={e => setEditFields({...editFields, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white outline-none" required /></div>
            <div><label className="block text-xs text-slate-400 mb-1">المبلغ المستحق له</label><input type="text" value={editFields.debtUSD > 0 ? editFields.debtUSD : editFields.debtSYP} onChange={e => setEditFields({...editFields, debtUSD: editFields.debtUSD > 0 ? e.target.value : 0, debtSYP: editFields.debtUSD === 0 ? e.target.value : 0})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-base font-mono font-bold text-rose-400 outline-none" required /></div>
          </>
        )

      case 'product':
        return (
          <>
            <div><label className="block text-xs text-slate-400 mb-1">اسم المادة</label><input type="text" value={editFields.name || ''} onChange={e => setEditFields({...editFields, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white outline-none" required /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="block text-xs text-slate-400 mb-1">التكلفة (USD)</label><input type="text" value={editFields.costUSD || ''} onChange={e => setEditFields({...editFields, costUSD: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-sm text-white font-mono outline-none" /></div>
              <div><label className="block text-xs text-slate-400 mb-1">المبيع (SYP)</label><input type="text" value={editFields.sellSYP || ''} onChange={e => setEditFields({...editFields, sellSYP: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-sm text-white font-mono outline-none" /></div>
            </div>
            <div><label className="block text-xs text-slate-400 mb-1">الكمية</label><input type="text" value={editFields.qty || ''} onChange={e => setEditFields({...editFields, qty: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white font-mono outline-none" required /></div>
          </>
        )

      case 'sale':
        return (
          <>
            <div><label className="block text-xs text-slate-400 mb-1">اسم الزبون</label><input type="text" value={editFields.customer || ''} onChange={e => setEditFields({...editFields, customer: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white outline-none" required /></div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">طريقة الدفع</label>
              <select value={editFields.type || 'نقدي'} onChange={e => setEditFields({...editFields, type: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white outline-none">
                <option value="نقدي">نقدي</option>
                <option value="آجل">آجل</option>
              </select>
            </div>
            <div><label className="block text-xs text-slate-400 mb-1">إجمالي الفاتورة (ل.س)</label><input type="text" value={editFields.totalSYP || ''} onChange={e => setEditFields({...editFields, totalSYP: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-base font-mono font-bold text-cyan-400 outline-none" required /></div>
          </>
        )

      case 'purchase':
        return (
          <>
            <div><label className="block text-xs text-slate-400 mb-1">اسم المورد</label><input type="text" value={editFields.supplier || ''} onChange={e => setEditFields({...editFields, supplier: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white outline-none" required /></div>
            <div><label className="block text-xs text-slate-400 mb-1">إجمالي الفاتورة (USD)</label><input type="text" value={editFields.totalUSD || ''} onChange={e => setEditFields({...editFields, totalUSD: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white font-mono outline-none" required /></div>
          </>
        )

      case 'voucher':
        return (
          <>
            <div><label className="block text-xs text-slate-400 mb-1">المبلغ المسدد</label><input type="text" value={editFields.amount || ''} onChange={e => setEditFields({...editFields, amount: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-base font-mono font-bold text-emerald-400 outline-none" required /></div>
            <div><label className="block text-xs text-slate-400 mb-1">البيان</label><input type="text" value={editFields.note || ''} onChange={e => setEditFields({...editFields, note: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white outline-none" /></div>
          </>
        )

      case 'expense':
        return (
          <>
            <div><label className="block text-xs text-slate-400 mb-1">البيان</label><input type="text" value={editFields.title || ''} onChange={e => setEditFields({...editFields, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white outline-none" required /></div>
            <div><label className="block text-xs text-slate-400 mb-1">المبلغ</label><input type="text" value={editFields.amount || ''} onChange={e => setEditFields({...editFields, amount: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white font-mono outline-none" required /></div>
            <div><label className="block text-xs text-slate-400 mb-1">ملاحظات</label><input type="text" value={editFields.note || ''} onChange={e => setEditFields({...editFields, note: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white outline-none" /></div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans" dir="rtl">
      
      <datalist id="customers-list">
        {customersList.map(c => <option key={c.id} value={c.name} />)}
      </datalist>
      <datalist id="suppliers-list">
        {suppliersList.map(s => <option key={s.id} value={s.name} />)}
      </datalist>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImportBackup} 
        accept=".json" 
        className="hidden" 
      />

      {/* القائمة الجانبية */}
      <aside className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col p-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg border border-slate-700">
            R
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white leading-tight">مركز رامي للاتصالات</h1>
            <p className="text-xs text-emerald-400 font-bold tracking-wider">RAMI TELECOM</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('sales')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'sales' ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <ShoppingCart className="w-5 h-5 text-blue-400" />
            نقطة البيع (سلة المبيعات)
          </button>

          <button 
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'inventory' ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <Package className="w-5 h-5 text-indigo-400" />
            جرد المخزون والمواد
          </button>

          <button 
            onClick={() => { setActiveTab('vouchers'); setSelectedCustomerForHistory(null) }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'vouchers' ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <Landmark className="w-5 h-5 text-amber-400" />
            السندات المالية (قبض ودفع)
          </button>

          <button 
            onClick={() => { setActiveTab('customers'); setSelectedCustomerForHistory(null) }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'customers' ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <UserCheck className="w-5 h-5 text-emerald-400" />
            قائمة الزبائن وكشوف الحساب
          </button>

          <button 
            onClick={() => setActiveTab('suppliers')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'suppliers' ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <Truck className="w-5 h-5 text-rose-400" />
            قائمة الموردين والشركات
          </button>

          <button 
            onClick={() => setActiveTab('balance')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'balance' ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <ArrowLeftRight className="w-5 h-5 text-purple-400" />
            تحويل الرصيد والوحدات
          </button>

          <button 
            onClick={() => setActiveTab('vault')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'vault' ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <Vault className="w-5 h-5 text-teal-400" />
            صندوق الكاش (الدرج)
          </button>

          <button 
            onClick={() => setActiveTab('purchases')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'purchases' ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <FileText className="w-5 h-5 text-violet-400" />
            فواتير الشراء والتوريد
          </button>

          <button 
            onClick={() => setActiveTab('expenses')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'expenses' ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <Receipt className="w-5 h-5 text-pink-400" />
            مصاريف ونفقات المحل
          </button>

          <button 
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'reports' ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <BarChart3 className="w-5 h-5 text-yellow-400" />
            لوحة الأرباح والتقارير
          </button>

          <button 
            onClick={() => setActiveTab('backup')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'backup' ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <Database className="w-5 h-5 text-sky-400" />
            النسخ الاحتياطي والأمان
          </button>

          <button 
            onClick={() => setActiveTab('rates')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'rates' ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <DollarSign className="w-5 h-5 text-teal-400" />
            سعر الصرف (USD / SYP)
          </button>
        </nav>

        <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl mt-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>حفظ تلقائي دوري:</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-300 font-semibold truncate">
            {lastBackupTime}
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl mt-2">
          <div className="text-xs text-slate-400 mb-1">سعر الصرف المعتمد:</div>
          <div className="text-sm font-bold text-white font-mono">
            1 USD = <span className="text-emerald-400">{fmt(exchangeRate)}</span> SYP
          </div>
        </div>
      </aside>

      {/* منطقة المحتوى الرئيسي */}
      <main className="flex-1 overflow-y-auto p-8 bg-slate-950">
        
        {/* ===================== 1. نقطة البيع ===================== */}
        {activeTab === 'sales' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">نقطة البيع (سلة الفاتورة المتعددة)</h2>
                <p className="text-xs text-slate-400">إضافة عدة منتجات للسلة، إصدار فاتورة موحدة، مع إمكانية إلغاء الفاتورة أو إعادتها للتعديل وعكس الأثر</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl flex items-center gap-6 shadow-xl">
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">إجمالي السلة الحالية:</span>
                  <span className="text-2xl font-black font-mono text-emerald-400">{fmt(cartTotalSYP)} SYP</span>
                </div>
                <div className="text-xs font-mono text-slate-400 border-r border-slate-700 pr-4">
                  ربح السلة: <strong className="text-cyan-400 block text-sm">+{fmt(cartProfitSYP)} SYP</strong>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="col-span-1 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-400" />
                    البحث وإضافة المنتجات للسلة
                  </h3>

                  <div className="relative mb-3">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                    <input 
                      type="text"
                      value={posProductSearch}
                      onChange={e => setPosProductSearch(e.target.value)}
                      placeholder="ابحث عن مادة لإضافتها للسلة..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-10 pl-3 py-2.5 text-xs text-white outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                    {filteredProductsForPOS.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">لا توجد مواد مطابقة</div>
                    ) : (
                      filteredProductsForPOS.map(p => {
                        const sellPriceSYP = p.sellCur === 'USD' ? Math.round(p.sellUSD * exchangeRate) : (p.sellSYP || Math.round((p.sellUSD || 0) * exchangeRate))
                        return (
                          <div key={p.id} className="p-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center justify-between hover:border-slate-600 transition">
                            <div>
                              <span className="font-bold text-xs text-white block">{p.name}</span>
                              <span className="text-[10px] text-slate-400">المتوفر: {p.qty} | <strong className="font-mono text-cyan-400">{fmt(sellPriceSYP)} SYP</strong></span>
                            </div>
                            <button 
                              type="button"
                              onClick={() => addToCart(p)}
                              className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-lg transition"
                              title="إضافة للسلة"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-emerald-400" />
                      محتويات سلة الفاتورة ({cart.length} مواد)
                    </h3>
                    {cart.length > 0 && (
                      <button onClick={() => setCart([])} className="text-xs text-rose-400 hover:underline">
                        تفريغ السلة
                      </button>
                    )}
                  </div>

                  {cart.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl mb-4">
                      السلة فارغة حالياً. ابحث عن المنتجات في القائمة الجانبية واضغط (+) لإضافتها.
                    </div>
                  ) : (
                    <div className="max-h-56 overflow-y-auto mb-4 border border-slate-800 rounded-xl overflow-hidden">
                      <table className="w-full text-right text-xs">
                        <thead>
                          <tr className="bg-slate-800/80 text-slate-400 border-b border-slate-700">
                            <th className="p-2.5">المادة</th>
                            <th className="p-2.5">سعر الإفراد</th>
                            <th className="p-2.5 text-center">الكمية</th>
                            <th className="p-2.5">الإجمالي</th>
                            <th className="p-2.5 text-center">حذف</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {cart.map(item => (
                            <tr key={item.product.id} className="hover:bg-slate-800/30">
                              <td className="p-2.5 font-bold text-white">{item.product.name}</td>
                              <td className="p-2.5 font-mono text-slate-300">{fmt(item.unitPriceSYP)} SYP</td>
                              <td className="p-2.5 text-center">
                                <input 
                                  type="number"
                                  min="1"
                                  value={item.qty}
                                  onChange={e => updateCartQty(item.product.id, parseInt(e.target.value) || 1)}
                                  className="w-14 bg-slate-800 border border-slate-700 rounded-lg p-1 text-center font-mono font-bold text-white outline-none"
                                />
                              </td>
                              <td className="p-2.5 font-mono font-bold text-cyan-400">{fmt(item.totalSYP)} SYP</td>
                              <td className="p-2.5 text-center">
                                <button onClick={() => removeFromCart(item.product.id)} className="text-rose-400 hover:text-rose-300 p-1">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <form onSubmit={handleCheckoutSale} className="pt-3 border-t border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <label className="block text-[11px] text-slate-400 mb-1">اسم الزبون</label>
                    <input 
                      type="text"
                      list="customers-list"
                      value={saleCustomer}
                      onChange={e => setSaleCustomer(e.target.value)}
                      placeholder="زبون نقدي عام أو اختر اسمه..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="w-40">
                    <label className="block text-[11px] text-slate-400 mb-1">طريقة الدفع</label>
                    <select 
                      value={saleType}
                      onChange={e => setSaleType(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-white outline-none"
                    >
                      <option value="نقدي">نقدي (كاش للدرج)</option>
                      <option value="آجل">آجل (دين على الزبون)</option>
                    </select>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={cart.length === 0}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-lg shadow-emerald-950 text-xs whitespace-nowrap flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      تأكيد وحفظ الفاتورة
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-800/40 border-b border-slate-800 flex justify-between items-center">
                <span className="font-bold text-sm text-white">سجل وأرشيف فواتير المبيعات</span>
                <span className="text-xs text-slate-400">يمكنك إلغاء أي فاتورة أو إعادتها إلى السلة لتعديلها مع عكس الأثر فوراً</span>
              </div>
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400">
                    <th className="p-3">رقم الفاتورة</th>
                    <th className="p-3">الزبون</th>
                    <th className="p-3">المواد المشتراة</th>
                    <th className="p-3">الإجمالي (SYP)</th>
                    <th className="p-3">الربح</th>
                    <th className="p-3">نوع الدفع</th>
                    <th className="p-3">التاريخ والوقت</th>
                    <th className="p-3 text-center">إجراءات الفاتورة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {salesList.length === 0 ? (
                    <tr><td colSpan={8} className="p-6 text-center text-slate-500">لا توجد فواتير مبيعات مسجلة بعد</td></tr>
                  ) : (
                    salesList.map(s => {
                      const displayItems = s.items ? s.items.map((i: any) => `${i.productName} (${i.qty})`).join('، ') : (s.productName || 'مادة متنوعة')
                      const timeStr = s.createdAt ? new Date(s.createdAt).toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' }) : ''
                      return (
                        <tr key={s.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-slate-300">{s.id}</td>
                          <td className="p-3 text-white font-semibold">{s.customer}</td>
                          <td className="p-3 text-slate-300 max-w-xs truncate" title={displayItems}>{displayItems}</td>
                          <td className="p-3 font-mono font-bold text-cyan-400">{fmt(s.totalSYP)} SYP</td>
                          <td className="p-3 font-mono font-bold text-emerald-400">+{fmt(s.profitSYP)} SYP</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.type === 'نقدي' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
                              {s.type}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-400">{s.date} {timeStr && <span className="text-slate-500">({timeStr})</span>}</td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                type="button"
                                onClick={() => handleReloadSaleToCart(s.id)} 
                                className="bg-slate-800 hover:bg-slate-700 text-amber-400 p-1.5 rounded-lg border border-slate-700 transition"
                                title="إعادة الفاتورة للسلة للتعديل"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                type="button"
                                onClick={() => openEditModal('sale', s)} 
                                className="bg-slate-800 hover:bg-slate-700 text-blue-400 p-1.5 rounded-lg border border-slate-700 transition"
                                title="تعديل بيانات الفاتورة مباشرة"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleDeleteSale(s.id)} 
                                className="bg-slate-800 hover:bg-rose-950 text-rose-400 p-1.5 rounded-lg border border-slate-700 transition"
                                title="إلغاء وحذف الفاتورة وعكس الأثر"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== 2. كشف حساب الزبون ===================== */}
        {activeTab === 'customers' && (
          <div>
            {!selectedCustomerForHistory ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">قائمة الزبائن واستحقاقاتهم المالية</h2>
                    <p className="text-xs text-slate-400">إدارة ذمم الزبائن، تعديل الأخطاء، وكشف حساب تفصيلي تراكمي</p>
                  </div>
                  <div className="bg-slate-900 border border-emerald-800/50 px-5 py-3 rounded-2xl shadow-lg">
                    <span className="text-xs text-slate-400 block mb-0.5">إجمالي الديون لنا:</span>
                    <span className="text-xl font-black font-mono text-emerald-400">+{fmt(totalCustomerDebtsSYP)} SYP</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="col-span-1 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                    <input 
                      type="text" 
                      value={customerSearch} 
                      onChange={e => setCustomerSearch(e.target.value)} 
                      placeholder="ابحث عن زبون..." 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white outline-none" 
                    />
                  </div>
                  <div className="col-span-2">
                    <form onSubmit={handleAddOrUpdateCustomer} className="flex gap-2">
                      <input type="text" value={cFormName} onChange={e => setCFormName(e.target.value)} placeholder="اسم الزبون..." className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none" required />
                      <input type="text" value={cFormPhone} onChange={e => setCFormPhone(e.target.value)} placeholder="الهاتف" className="w-36 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-mono outline-none" />
                      <input type="text" value={cFormAmount} onChange={e => setCFormAmount(e.target.value)} placeholder="دين افتتاحي" className="w-32 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-mono outline-none" />
                      <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl transition text-xs whitespace-nowrap">+ تسجيل زبون</button>
                    </form>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <table className="w-full text-right text-sm">
                    <thead>
                      <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400">
                        <th className="p-4">اسم الزبون</th>
                        <th className="p-4">الهاتف</th>
                        <th className="p-4">المبلغ المستحق عليه</th>
                        <th className="p-4 text-center">كشف الحساب التراكمي</th>
                        <th className="p-4 text-center">تعديل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredCustomers.map(c => (
                        <tr key={c.id} className="hover:bg-slate-800/40">
                          <td className="p-4 font-semibold text-white">{c.name}</td>
                          <td className="p-4 font-mono text-slate-400">{c.phone || '-'}</td>
                          <td className="p-4 font-mono font-bold text-amber-400 text-base">{fmt(c.debtSYP)} SYP</td>
                          <td className="p-4 text-center">
                            <button 
                              type="button"
                              onClick={() => setSelectedCustomerForHistory(c)} 
                              className="bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs px-3.5 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 mx-auto transition"
                            >
                              <History className="w-4 h-4" /> كشف حساب تفصيلي
                            </button>
                          </td>
                          <td className="p-4 text-center">
                            <button 
                              type="button"
                              onClick={() => openEditModal('customer', c)} 
                              className="text-amber-400 p-1.5 hover:bg-slate-800 rounded-lg"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedCustomerForHistory(null)} className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 hover:bg-slate-700 transition">
                      <ArrowLeft className="w-5 h-5 rotate-180" />
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold text-white">تقرير كشف حساب الزبون: {selectedCustomerForHistory.name}</h2>
                      <p className="text-xs text-slate-400">الهاتف: {selectedCustomerForHistory.phone || 'غير مسجل'}</p>
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-6 shadow-xl">
                    <span className="text-xs text-slate-400">الرصيد المتبقي النهائي:</span>
                    <span className="text-2xl font-black font-mono text-amber-400">{fmt(selectedCustomerForHistory.debtSYP)} SYP</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mb-6">
                  <div className="p-4 bg-slate-800/40 border-b border-slate-800 font-bold text-sm text-white flex justify-between items-center">
                    <span>جدول الحركات التفصيلية (مرتب زمنياً بالساعة والدقيقة)</span>
                    <span className="text-xs text-slate-400 font-normal">إجمالي الحركات: {customerStatementEntries.length}</span>
                  </div>
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400">
                        <th className="p-3">التاريخ والوقت</th>
                        <th className="p-3">نوع العملية</th>
                        <th className="p-3">البيان والتفاصيل</th>
                        <th className="p-3">مدين (+ دين)</th>
                        <th className="p-3">دائن (- مسدد)</th>
                        <th className="p-3">الرصيد التراكمي المتبقي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {customerStatementEntries.length === 0 ? (
                        <tr><td colSpan={6} className="p-6 text-center text-slate-500">لا توجد حركات مسجلة لهذا الزبون</td></tr>
                      ) : (
                        customerStatementEntries.map((e, idx) => {
                          const dateObj = new Date(e.date)
                          const formattedDate = dateObj.toLocaleDateString('ar-SY')
                          const formattedTime = dateObj.toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })
                          return (
                            <tr key={idx} className="hover:bg-slate-800/30">
                              <td className="p-3 font-mono text-slate-300 whitespace-nowrap">{formattedDate} <span className="text-slate-500">({formattedTime})</span></td>
                              <td className="p-3 font-semibold text-white">{e.type}</td>
                              <td className="p-3 text-slate-300">{e.description}</td>
                              <td className="p-3 font-mono font-bold text-amber-400">{e.debit > 0 ? `+${fmt(e.debit)} SYP` : '-'}</td>
                              <td className="p-3 font-mono font-bold text-emerald-400">{e.credit > 0 ? `-${fmt(e.credit)} SYP` : '-'}</td>
                              <td className="p-3 font-mono font-black text-cyan-300 text-sm">{fmt(e.runningBalance)} SYP</td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== 3. المخزون ===================== */}
        {activeTab === 'inventory' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">جرد المواد والمخزون</h2>
            <p className="text-xs text-slate-400 mb-6">إدخال سعر التكلفة وسعر المبيع بالدولار (USD) أو بالليرة السورية (SYP)</p>
            
            <form onSubmit={addProduct} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-8 grid grid-cols-4 gap-4 shadow-xl">
              <div>
                <label className="block text-xs text-slate-400 mb-1">اسم المادة</label>
                <input type="text" value={pName} onChange={e => setPName(e.target.value)} placeholder="مثال: شاشة سامسونج A12" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white outline-none" required />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">التصنيف</label>
                <select value={pCat} onChange={e => setPCat(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white outline-none">
                  <option>قطع صيانة</option>
                  <option>إكسسوارات</option>
                  <option>موبايلات</option>
                  <option>أدوات كهربائية</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">سعر التكلفة (الشراء)</label>
                <div className="flex gap-1.5">
                  <input type="text" value={pCost} onChange={e => setPCost(e.target.value)} placeholder="15" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white font-mono outline-none" required />
                  <select 
                    value={pCostCur} 
                    onChange={e => setPCostCur(e.target.value as any)} 
                    className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 text-xs font-mono font-bold text-emerald-400"
                  >
                    <option value="USD">USD</option>
                    <option value="SYP">SYP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">سعر المبيع (للزبون)</label>
                <div className="flex gap-1.5">
                  <input type="text" value={pSell} onChange={e => setPSell(e.target.value)} placeholder="280000" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white font-mono outline-none" required />
                  <select 
                    value={pSellCur} 
                    onChange={e => setPSellCur(e.target.value as any)} 
                    className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 text-xs font-mono font-bold text-cyan-400"
                  >
                    <option value="SYP">SYP</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">الكمية المتوفرة</label>
                <input type="text" value={pQty} onChange={e => setPQty(e.target.value)} placeholder="5" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white font-mono outline-none" required />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">تنبيه عند نفاد</label>
                <input type="text" value={pAlert} onChange={e => setPAlert(e.target.value)} placeholder="2" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white font-mono outline-none" />
              </div>

              <div className="col-span-2 flex items-end">
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition">
                  + إضافة المادة للمستودع
                </button>
              </div>
            </form>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400">
                    <th className="p-4">اسم المادة</th>
                    <th className="p-4">التصنيف</th>
                    <th className="p-4">سعر التكلفة (USD / SYP)</th>
                    <th className="p-4">سعر المبيع (USD / SYP)</th>
                    <th className="p-4">المتوفر بالمحل</th>
                    <th className="p-4 text-center">تعديل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {products.map(p => {
                    const sellPriceSYP = p.sellCur === 'USD' ? Math.round(p.sellUSD * exchangeRate) : (p.sellSYP || Math.round((p.sellUSD || 0) * exchangeRate))
                    const costPriceUSD = p.costUSD || (p.costSYP ? (p.costSYP / exchangeRate).toFixed(2) : 0)
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="p-4 font-semibold text-white">{p.name}</td>
                        <td className="p-4"><span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs">{p.category}</span></td>
                        <td className="p-4 font-mono text-emerald-400 font-bold">
                          ${fmt(Number(costPriceUSD))} <span className="text-xs text-slate-500 font-normal">({fmt(Math.round(Number(costPriceUSD) * exchangeRate))} SYP)</span>
                        </td>
                        <td className="p-4 font-mono text-cyan-400 font-bold">
                          {fmt(sellPriceSYP)} SYP {p.sellCur === 'USD' && <span className="text-xs text-slate-400">(${fmt(p.sellUSD)})</span>}
                        </td>
                        <td className="p-4 font-mono">{fmt(p.qty)} قطع</td>
                        <td className="p-4 text-center">
                          <button 
                            type="button"
                            onClick={() => openEditModal('product', p)} 
                            className="text-amber-400 hover:text-amber-300 p-1.5 hover:bg-slate-800 rounded-lg transition" 
                            title="تعديل المادة"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== 4. السندات المالية ===================== */}
        {activeTab === 'vouchers' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">السندات المالية (سندات القبض وسندات الدفع)</h2>
                <p className="text-xs text-slate-400">إصدار ومتابعة وتعديل سندات القبض النقدية من الزبائن وسندات الدفع النقدية للموردين</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-slate-900 border border-emerald-800/50 px-4 py-2.5 rounded-2xl shadow-lg">
                  <span className="text-xs text-slate-400 block">إجمالي المقبوض بالسندات:</span>
                  <span className="text-lg font-black font-mono text-emerald-400">+{fmt(cashFromReceiptVouchers)} SYP</span>
                </div>
                <div className="bg-slate-900 border border-rose-800/50 px-4 py-2.5 rounded-2xl shadow-lg">
                  <span className="text-xs text-slate-400 block">إجمالي المدفوع بالسندات:</span>
                  <span className="text-lg font-black font-mono text-rose-400">-{fmt(cashOutPaymentVouchers)} SYP</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateVoucher} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-8 shadow-xl">
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">نوع السند</label>
                  <select value={vFormType} onChange={e => { setVFormType(e.target.value as any); setVFormPartyId('') }} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm font-bold text-white outline-none">
                    <option value="سند قبض">سند قبض (من زبون - يدخل الدرج)</option>
                    <option value="سند دفع">سند دفع (إلى مورد - يخرج من الدرج)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{vFormType === 'سند قبض' ? 'اختر الزبون' : 'اختر المورد'}</label>
                  <select value={vFormPartyId} onChange={e => setVFormPartyId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white outline-none" required>
                    <option value="">-- اضغط للاختيار --</option>
                    {vFormType === 'سند قبض' ? customersList.map(c => (
                      <option key={c.id} value={c.id}>{c.name} (بذمته: {fmt(c.debtSYP)} SYP)</option>
                    )) : suppliersList.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (له: {s.debtUSD > 0 ? `$${fmt(s.debtUSD)}` : `${fmt(s.debtSYP)} SYP`})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">المبلغ</label>
                  <input type="text" value={vFormAmount} onChange={e => setVFormAmount(e.target.value)} placeholder="مثال: 5000" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white font-mono font-bold outline-none" required />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">بيان السند</label>
                  <input type="text" value={vFormNote} onChange={e => setVFormNote(e.target.value)} placeholder="دفعة نقداً" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white outline-none" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className={`font-bold px-6 py-2.5 rounded-xl transition shadow-lg text-sm ${vFormType === 'سند قبض' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white'}`}>
                  {vFormType === 'سند قبض' ? 'اعتماد سند القبض' : 'اعتماد سند الدفع'}
                </button>
              </div>
            </form>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-800/40 border-b border-slate-800 flex justify-between items-center">
                <span className="font-bold text-sm text-white">سجل وأرشيف السندات المنفذة</span>
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  <input 
                    type="text" 
                    value={voucherSearch} 
                    onChange={e => setVoucherSearch(e.target.value)} 
                    placeholder="ابحث برقم السند أو الاسم..." 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pr-8 pl-3 py-1.5 text-xs text-white outline-none focus:border-amber-500" 
                  />
                </div>
              </div>
              <table className="w-full text-right text-xs">
                <thead><tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400"><th className="p-3">رقم السند</th><th className="p-3">نوع السند</th><th className="p-3">الطرف</th><th className="p-3">المبلغ</th><th className="p-3">البيان</th><th className="p-3">التاريخ</th><th className="p-3 text-center">تعديل</th></tr></thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredVouchers.map(v => (
                    <tr key={v.id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-slate-300">{v.voucherNumber}</td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded font-bold ${v.type === 'سند قبض' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>{v.type}</span></td>
                      <td className="p-3 font-semibold text-white">{v.partyName}</td>
                      <td className={`p-3 font-mono font-bold text-sm ${v.type === 'سند قبض' ? 'text-emerald-400' : 'text-rose-400'}`}>{v.type === 'سند قبض' ? '+' : '-'}{fmt(v.amount)} SYP</td>
                      <td className="p-3 text-slate-300">{v.note}</td>
                      <td className="p-3 font-mono text-slate-500">{v.date}</td>
                      <td className="p-3 text-center"><button type="button" onClick={() => openEditModal('voucher', v)} className="text-amber-400 p-1"><Edit className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== 5. الموردين ===================== */}
        {activeTab === 'suppliers' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div><h2 className="text-2xl font-bold text-white mb-1">قائمة الموردين واستحقاقاتهم المالية</h2><p className="text-xs text-slate-400">متابعة المستحقات بالدولار والليرة</p></div>
              <div className="bg-slate-900 border border-rose-800/50 px-5 py-3 rounded-2xl"><span className="text-xs text-slate-400 block mb-0.5">المستحق للموردين:</span><span className="text-xl font-black font-mono text-rose-400">-{fmt(totalSupplierDebtsSYP)} SYP</span></div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="col-span-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                <input type="text" value={supplierSearch} onChange={e => setSupplierSearch(e.target.value)} placeholder="ابحث عن مورد..." className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white outline-none" />
              </div>
              <div className="col-span-2">
                <form onSubmit={handleAddOrUpdateSupplier} className="flex gap-2">
                  <input type="text" value={sFormName} onChange={e => setSFormName(e.target.value)} placeholder="اسم المورد..." className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none" required />
                  <input type="text" value={sFormAmount} onChange={e => setSFormAmount(e.target.value)} placeholder="المبلغ" className="w-28 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-mono outline-none" />
                  <select value={sFormCur} onChange={e => setSFormCur(e.target.value)} className="bg-slate-800 border border-slate-800 rounded-xl px-2 text-xs text-white font-mono">
                    <option value="USD">USD</option>
                    <option value="SYP">SYP</option>
                  </select>
                  <button type="submit" className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2.5 rounded-xl transition text-xs">+ تسجيل مورد</button>
                </form>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-right text-sm">
                <thead><tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400"><th className="p-4">اسم المورد</th><th className="p-4">الهاتف</th><th className="p-4">المبلغ المستحق</th><th className="p-4 text-center">تعديل</th></tr></thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredSuppliers.map(s => (
                    <tr key={s.id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-semibold text-white">{s.name}</td>
                      <td className="p-4 font-mono text-slate-400">{s.phone || '-'}</td>
                      <td className="p-4 font-mono font-bold text-rose-400 text-base">{s.debtUSD > 0 ? `$${fmt(s.debtUSD)}` : `${fmt(s.debtSYP)} SYP`}</td>
                      <td className="p-4 text-center"><button type="button" onClick={() => openEditModal('supplier', s)} className="text-amber-400 p-1.5"><Edit className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== 6. تحويل الرصيد والوحدات ===================== */}
        {activeTab === 'balance' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div><h2 className="text-2xl font-bold text-white mb-1">خدمات تحويل الرصيد والوحدات</h2><p className="text-xs text-slate-400">حساب فوري للأرباح مع خيار نقداً أو آجل</p></div>
              <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono text-emerald-400 font-bold">{unitPrice} ل.س / وحدة</span>
                <input 
                  type="text" 
                  value={unitWholesaleCost} 
                  onChange={e => setUnitWholesaleCost(e.target.value)} 
                  className="w-28 bg-slate-800 border border-slate-700 rounded-xl px-2 text-xs text-center font-mono font-bold text-white outline-none" 
                />
              </div>
            </div>

            <form onSubmit={addBalanceOp} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl mb-8 grid grid-cols-4 gap-4 shadow-xl">
              <div><label className="block text-xs text-slate-400 mb-1">الزبون</label><input type="text" list="customers-list" value={bCustomerName} onChange={e => setBCustomerName(e.target.value)} placeholder="اسم الزبون..." className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white outline-none" /></div>
              <div><label className="block text-xs text-slate-400 mb-1">رقم الهاتف</label><input type="text" value={bPhone} onChange={e => setBPhone(e.target.value)} placeholder="09xxxxxxxx" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white font-mono outline-none" required /></div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">نوع الخدمة</label>
                <select value={bType} onChange={e => setBType(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white outline-none">
                  <option value="سيريتل وحدات">سيريتل وحدات</option>
                  <option value="MTN وحدات">MTN وحدات</option>
                  <option value="سيريتل كاش">سيريتل كاش</option>
                  <option value="كاش MTN">كاش MTN</option>
                  <option value="تسديد فواتير">تسديد فواتير</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">طريقة الدفع</label>
                <select value={bPaymentType} onChange={e => setBPaymentType(e.target.value as 'نقدي' | 'آجل')} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white outline-none">
                  <option value="نقدي">نقداً (يدخل الدرج)</option>
                  <option value="آجل">آجل (دين للذمة)</option>
                </select>
              </div>
              {isUnitsMode ? (
                <div><label className="block text-xs text-slate-400 mb-1">عدد الوحدات</label><input type="text" value={bUnits} onChange={e => setBUnits(e.target.value)} placeholder="10000" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white font-mono outline-none" required /></div>
              ) : (
                <div><label className="block text-xs text-slate-400 mb-1">التكلفة (ل.س)</label><input type="text" value={bDirectCost} onChange={e => setBDirectCost(e.target.value)} placeholder="47500" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white font-mono outline-none" required /></div>
              )}
              <div className="col-span-3"><label className="block text-xs text-slate-400 mb-1">المبلغ المطلوب (ل.س)</label><input type="text" value={bAmount} onChange={e => setBAmount(e.target.value)} placeholder="1300" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white font-mono outline-none" required /></div>
              <div className="col-span-4 bg-slate-800/60 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                <div className="text-xs">التكلفة: <strong className="font-mono text-slate-300">{fmt(calculatedCost)}</strong> | الربح: <strong className="font-mono text-emerald-400">+{fmt(calculatedProfit)}</strong> ({calculatedMargin}%)</div>
                <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2 rounded-xl transition text-sm">تسجيل العملية</button>
              </div>
            </form>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-right text-sm">
                <thead><tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400"><th className="p-4">الزبون</th><th className="p-4">الرقم</th><th className="p-4">الخدمة</th><th className="p-4">الوحدات</th><th className="p-4">المبلغ</th><th className="p-4">الدفع</th><th className="p-4">الربح</th><th className="p-4 text-center">تعديل</th></tr></thead>
                <tbody className="divide-y divide-slate-800">
                  {balanceOps.map(op => (
                    <tr key={op.id} className="hover:bg-slate-800/40">
                      <td className="p-4 text-white">{op.customerName}</td>
                      <td className="p-4 font-mono text-slate-300">{op.phone}</td>
                      <td className="p-4"><span className="bg-slate-800 text-purple-300 px-2 py-0.5 rounded text-xs">{op.type}</span></td>
                      <td className="p-4 font-mono text-slate-300">{op.units > 0 ? fmt(op.units) : '-'}</td>
                      <td className="p-4 font-mono text-cyan-400 font-bold">{fmt(op.amount)} SYP</td>
                      <td className="p-4"><span className={`px-2 py-0.5 rounded text-xs font-bold ${op.paymentType === 'نقدي' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'}`}>{op.paymentType}</span></td>
                      <td className="p-4 font-mono text-emerald-400 font-bold">+{fmt(op.profit)} SYP</td>
                      <td className="p-4 text-center">
                        <button 
                          type="button"
                          onClick={() => openBalanceEdit(op)} 
                          className="text-amber-400 p-1.5 hover:bg-slate-800 rounded-lg transition"
                          title="تعديل عملية الرصيد"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== 7. صندوق الكاش (المستعاد بالكامل) ===================== */}
        {activeTab === 'vault' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">صندوق الكاش (رصيد درج المحل)</h2>
                <p className="text-xs text-slate-400">مطابقة السيولة النقدية المتوفرة باليد في درج المحل</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
                <span className="text-xs text-slate-400 font-semibold">رصيد أول المدة:</span>
                <input 
                  type="text" 
                  value={openingBalance} 
                  onChange={e => setOpeningBalance(e.target.value)} 
                  className="w-32 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-center font-mono font-bold text-amber-400 outline-none" 
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>إجمالي المقبوض نقداً</span>
                  <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400">+{fmt(totalCashIn)} SYP</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>إجمالي المدفوع نقداً</span>
                  <ArrowUpRight className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-black font-mono text-rose-400">-{fmt(totalCashOut)} SYP</div>
              </div>

              <div className="bg-slate-900 border border-amber-900/60 p-6 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between text-xs text-amber-400 font-bold mb-2">
                  <span>الرصيد النقدي المتواجد بالدرج الآن</span>
                  <Vault className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-black font-mono text-amber-400">{fmt(currentVaultCash)} SYP</div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== 8. فواتير الشراء والتوريد (المستعاد بالكامل) ===================== */}
        {activeTab === 'purchases' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">فواتير الشراء والتوريد</h2>
            <p className="text-xs text-slate-400 mb-6">تسجيل فواتير البضاعة الواردة من الموردين والشركات</p>
            <form onSubmit={addPurchase} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl mb-8 grid grid-cols-3 gap-4 shadow-xl">
              <div><label className="block text-xs text-slate-400 mb-1">المورد</label><input type="text" list="suppliers-list" value={purSupplier} onChange={e => setPurSupplier(e.target.value)} placeholder="اسم المورد..." className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white outline-none" required /></div>
              <div><label className="block text-xs text-slate-400 mb-1">الإجمالي</label><div className="flex gap-2"><input type="text" value={purTotal} onChange={e => setPurTotal(e.target.value)} placeholder="250" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white font-mono outline-none" required /><select value={purCur} onChange={e => setPurCur(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl px-3 text-sm text-white font-mono"><option value="USD">USD</option><option value="SYP">SYP</option></select></div></div>
              <div className="flex items-end"><button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition">تسجيل فاتورة التوريد</button></div>
            </form>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-right text-sm">
                <thead><tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400"><th className="p-4">رقم السند</th><th className="p-4">المورد</th><th className="p-4">القيمة</th><th className="p-4 text-center">تعديل</th></tr></thead>
                <tbody className="divide-y divide-slate-800">
                  {purchasesList.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-mono font-bold text-slate-300">{p.id}</td>
                      <td className="p-4 text-white">{p.supplier}</td>
                      <td className="p-4 font-mono font-bold text-indigo-400">${fmt(p.totalUSD)}</td>
                      <td className="p-4 text-center"><button type="button" onClick={() => openEditModal('purchase', p)} className="text-amber-400 p-1"><Edit className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== 9. مصاريف ونفقات المحل (المستعاد بالكامل) ===================== */}
        {activeTab === 'expenses' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">مصاريف ونفقات المحل</h2>
            <p className="text-xs text-slate-400 mb-6">تسجيل فواتير المولد، الكهرباء، والنت (تخصم من الصندوق وصافي الربح)</p>
            <form onSubmit={addExpense} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl mb-8 grid grid-cols-4 gap-4 shadow-xl">
              <div><label className="block text-xs text-slate-400 mb-1">البيان</label><input type="text" value={expTitle} onChange={e => setExpTitle(e.target.value)} placeholder="اشتراك مولدة..." className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white outline-none" required /></div>
              <div><label className="block text-xs text-slate-400 mb-1">المبلغ</label><div className="flex gap-2"><input type="text" value={expAmount} onChange={e => setExpAmount(e.target.value)} placeholder="120000" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white font-mono outline-none" required /><select value={expCur} onChange={e => setExpCur(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl px-3 text-sm text-white font-mono"><option value="SYP">SYP</option><option value="USD">USD</option></select></div></div>
              <div><label className="block text-xs text-slate-400 mb-1">ملاحظات</label><input type="text" value={expNote} onChange={e => setExpNote(e.target.value)} placeholder="تفاصيل..." className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white outline-none" /></div>
              <div className="flex items-end"><button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl transition">تسجيل المصروف</button></div>
            </form>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-right text-sm">
                <thead><tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400"><th className="p-4">البيان</th><th className="p-4">المبلغ</th><th className="p-4">ملاحظات</th><th className="p-4 text-center">تعديل</th></tr></thead>
                <tbody className="divide-y divide-slate-800">
                  {expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-800/40">
                      <td className="p-4 text-white">{exp.title}</td>
                      <td className="p-4 font-mono font-bold text-rose-400">{exp.cur === 'USD' ? '$' + fmt(exp.amount) : fmt(exp.amount) + ' SYP'}</td>
                      <td className="p-4 text-slate-400 text-xs">{exp.note || '-'}</td>
                      <td className="p-4 text-center"><button type="button" onClick={() => openEditModal('expense', exp)} className="text-amber-400 p-1"><Edit className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== 10. لوحة الأرباح والتقارير (المستعاد بالكامل) ===================== */}
        {activeTab === 'reports' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">لوحة الأرباح والتقارير المالية المباشرة</h2>
            <p className="text-xs text-slate-400 mb-8">حسابات حية وفورية لصافي الأرباح والديون</p>
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>مجمل الأرباح</span>
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-black font-mono text-cyan-400">+{fmt(grossProfit)} SYP</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>إجمالي المصاريف</span>
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-black font-mono text-rose-400">-{fmt(totalExpensesSYP)} SYP</div>
              </div>

              <div className="bg-slate-900 border border-emerald-900/60 p-6 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between text-xs text-emerald-400 mb-2 font-bold">
                  <span>صافي الربح الفعلي</span>
                  <Wallet className="w-4 h-4 text-emerald-400" />
                </div>
                <div className={`text-2xl font-black font-mono ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>{netProfit >= 0 ? '+' : ''}{fmt(netProfit)} SYP</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>ديون الزبائن المستحقة</span>
                  <Users className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black font-mono text-amber-400">{fmt(totalCustomerDebtsSYP)} SYP</div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== 11. النسخ الاحتياطي ===================== */}
        {activeTab === 'backup' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                <Database className="w-6 h-6 text-sky-400" />
                النسخ الاحتياطي وأمان بيانات المحل
              </h2>
              <p className="text-xs text-slate-400">
                حفظ معلومات الزبائن، الموردين، المخزون، الصندوق، وكافة الفواتير تلقائياً وتصديرها دورياً لحمايتها من أي ضياع
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 mb-4">
                    <Download className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">تصدير وحفظ نسخة احتياطية كاملة</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    يقوم بتوليد ملف بيانات آمن بصيغة <span className="text-sky-400 font-mono">JSON</span> يحتوي على جميع السجلات الحالية.
                  </p>
                </div>
                <button 
                  onClick={handleExportBackup}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-sky-950 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  تحميل نسخة احتياطية الآن (.json)
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 mb-4">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">استرجاع البيانات من نسخة سابقة</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    استخدم هذا الخيار في حال قمت بنقل البرنامج إلى كمبيوتر آخر لاستعادة كافة الحسابات كما كانت.
                  </p>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-amber-950 flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  اختيار ملف النسخة واسترجاعها
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                حالة نظام الحفظ الذاتي في البرنامج
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-3 bg-slate-800/40 rounded-xl">
                  <span className="text-slate-400">الحفظ التلقائي المحلي الفوري:</span>
                  <span className="text-emerald-400 font-bold">مُفعل تلقائياً مع كل حركة</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-800/40 rounded-xl">
                  <span className="text-slate-400">آخر عملية تحديث وحفظ للبيانات:</span>
                  <span className="font-mono text-white font-bold">{lastBackupTime}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-800/40 rounded-xl">
                  <span className="text-slate-400">إجمالي سجلات الحسابات المحفوظة:</span>
                  <span className="font-mono text-slate-300">
                    {customersList.length} زبون | {suppliersList.length} مورد | {products.length} مادة | {voucherLogs.length} سند
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== 12. سعر الصرف ===================== */}
        {activeTab === 'rates' && (
          <div className="max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold text-white mb-2">تعديل سعر الصرف اليومي</h2>
            <p className="text-xs text-slate-400 mb-6">يتم تطبيقه على فواتير المبيع والشراء والمصاريف والديون</p>
            <div className="mb-6">
              <label className="block text-xs text-slate-400 mb-2">سعر صرف 1 دولار بالليرة السورية</label>
              <input type="text" value={tempRate} onChange={e => setTempRate(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-2xl font-mono font-bold text-emerald-400 outline-none" />
            </div>
            <button onClick={() => { const val = parseFloat(tempRate) || 15000; setExchangeRate(val); alert('تم اعتماد سعر الصرف بنجاح!') }} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-emerald-900/40">
              حفظ واعتماد السعر الجديد
            </button>
          </div>
        )}

        {/* ===================== نافذة تعديل الرصيد والوحدات المباشرة ===================== */}
        {balanceEditItem && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
              <button 
                type="button" 
                onClick={() => setBalanceEditItem(null)} 
                className="absolute top-4 left-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-lg font-bold text-white mb-4">تعديل وتصحيح عملية تحويل الرصيد</h3>

              <form onSubmit={handleSaveBalanceEdit} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">اسم الزبون</label>
                  <input 
                    type="text" 
                    value={beCustomerName} 
                    onChange={e => setBeCustomerName(e.target.value)} 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">رقم الهاتف</label>
                  <input 
                    type="text" 
                    value={bePhone} 
                    onChange={e => setBePhone(e.target.value)} 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white font-mono outline-none" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">نوع الخدمة</label>
                  <select 
                    value={beType} 
                    onChange={e => setBeType(e.target.value)} 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white outline-none"
                  >
                    <option value="سيريتل وحدات">سيريتل وحدات</option>
                    <option value="MTN وحدات">MTN وحدات</option>
                    <option value="سيريتل كاش">سيريتل كاش</option>
                    <option value="كاش MTN">كاش MTN</option>
                    <option value="تسديد فواتير">تسديد فواتير</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">طريقة الدفع</label>
                  <select 
                    value={bePaymentType} 
                    onChange={e => setBePaymentType(e.target.value as 'نقدي' | 'آجل')} 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white outline-none"
                  >
                    <option value="نقدي">نقدي</option>
                    <option value="آجل">آجل</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">عدد الوحدات (إن وجد)</label>
                    <input 
                      type="text" 
                      value={beUnits} 
                      onChange={e => setBeUnits(e.target.value)} 
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white font-mono outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">التكلفة المباشرة (ل.س)</label>
                    <input 
                      type="text" 
                      value={beCost} 
                      onChange={e => setBeCost(e.target.value)} 
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white font-mono outline-none" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">المبلغ المطلوب من الزبون (ل.س)</label>
                  <input 
                    type="text" 
                    value={beAmount} 
                    onChange={e => setBeAmount(e.target.value)} 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-base font-mono font-bold text-cyan-400 outline-none" 
                    required 
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-emerald-950"
                  >
                    حفظ التعديل
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================== نافذة التعديل الموحدة للأقسام الأخرى ===================== */}
        {editModal.type && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
              <button type="button" onClick={() => setEditModal({ type: null, item: null })} className="absolute top-4 left-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              <h3 className="text-lg font-bold text-white mb-4">تعديل وتصحيح المعاملة</h3>

              <form onSubmit={handleSaveUniversalEdit} className="space-y-4">
                {renderEditFields()}

                <div className="pt-2">
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-emerald-950">
                    حفظ التعديل
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}