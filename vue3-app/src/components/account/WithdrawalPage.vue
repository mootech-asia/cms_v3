<template>
  <section class="lobby-section ap-page" data-screen-label="Withdrawal">
    <button class="ap-back" @click="emit('navigate', 'Account Overview')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m14 6-6 6 6 6" />
      </svg>
      Back
    </button>
    <h1 class="ap-h1">Withdrawal</h1>

    <div class="ui-tablist--underline" role="tablist" aria-label="Withdrawal sections">
      <button
        v-for="tab in primaryTabs"
        :key="tab.id"
        type="button"
        class="ui-tab--underline"
        :class="{ active: primaryTab === tab.id }"
        role="tab"
        :aria-selected="primaryTab === tab.id"
        @click="primaryTab = tab.id"
      >{{ tab.label }}</button>
    </div>

    <template v-if="primaryTab === 'withdraw'">
      <div class="wd-method-tabs" role="tablist" aria-label="Withdrawal method">
        <button
          type="button"
          :class="{ active: withdrawMethod === 'bank' }"
          role="tab"
          :aria-selected="withdrawMethod === 'bank'"
          @click="withdrawMethod = 'bank'"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" />
          </svg>
          Bank Card
        </button>
        <button
          type="button"
          :class="{ active: withdrawMethod === 'crypto' }"
          role="tab"
          :aria-selected="withdrawMethod === 'crypto'"
          @click="withdrawMethod = 'crypto'"
        >
          <span class="wd-coin-mark" aria-hidden="true">B</span>
          Crypto Wallet
        </button>
      </div>

      <div class="ap-form-card wd-panel">
        <template v-if="withdrawMethod === 'bank'">
          <h2 class="ap-section-h"><span class="ap-mark"></span>Bank Card</h2>
          <div class="wd-account-card">
            <div class="wd-bank-logo" aria-hidden="true">SH</div>
            <div class="wd-account-copy">
              <strong>Shinhan Bank</strong>
              <span>********5123</span>
              <span>2025-01-08 21:22:25</span>
            </div>
          </div>

          <div class="wd-balance-list">
            <div class="wd-balance-row"><span>Central Wallet:</span><strong>0.00</strong></div>
            <div class="wd-balance-row"><span>Available Amount:</span><strong>0.00</strong></div>
          </div>

          <h2 class="ap-section-h"><span class="ap-mark"></span>Withdrawal Amount &amp; Password</h2>
          <div class="wd-form-grid">
            <label for="wd-bank-amount">Withdrawal Amount:</label>
            <input id="wd-bank-amount" v-model="bankAmount" class="ap-input" inputmode="numeric" placeholder="100,000 ~ 20,000,000" />
            <label for="wd-bank-password">Transaction Password:</label>
            <input id="wd-bank-password" v-model="bankPassword" class="ap-input" type="password" placeholder="Please fill in the transaction password" />
          </div>
          <button class="ap-btn-wide ap-grad" :disabled="!bankWithdrawReady" @click="submitWithdrawal('Bank card')">Submit</button>
        </template>

        <template v-else>
          <h2 class="ap-section-h"><span class="ap-mark"></span>Crypto Wallet</h2>
          <div class="wd-empty-wallet">
            <span class="wd-empty-symbol" aria-hidden="true">B</span>
            <strong>Empty wallet list</strong>
            <button type="button" class="wd-empty-action" @click="openCryptoManagement">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
              Add wallet
            </button>
          </div>

          <div class="wd-balance-list">
            <div class="wd-balance-row"><span>Central Wallet:</span><strong>0.00</strong></div>
            <div class="wd-balance-row"><span>Available Amount:</span><strong>0.00</strong></div>
          </div>

          <h2 class="ap-section-h"><span class="ap-mark"></span>Withdrawal Amount &amp; Password</h2>
          <div class="wd-form-grid">
            <label for="wd-wallet-type">Wallet Type:</label>
            <select id="wd-wallet-type" v-model="walletType" class="ap-input">
              <option value="" disabled>Please select wallet type</option>
              <option value="USDT-TRC20">USDT-TRC20</option>
              <option value="USDT-ERC20">USDT-ERC20</option>
              <option value="BTC">BTC</option>
            </select>
            <label for="wd-wallet-address">Wallet Address:</label>
            <input id="wd-wallet-address" v-model="walletAddress" class="ap-input" placeholder="Please fill in wallet address" />
            <label for="wd-crypto-amount">Withdrawal Amount:</label>
            <input id="wd-crypto-amount" v-model="cryptoAmount" class="ap-input" inputmode="numeric" placeholder="100,000 ~ 20,000,000" />
            <label for="wd-crypto-password">Transaction Password:</label>
            <input id="wd-crypto-password" v-model="cryptoPassword" class="ap-input" type="password" placeholder="Please fill in the transaction password" />
          </div>
          <button class="ap-btn-wide ap-grad" :disabled="!cryptoWithdrawReady" @click="submitWithdrawal('Crypto wallet')">Submit</button>
        </template>
      </div>
    </template>

    <template v-else>
      <div class="ap-form-card wd-panel">
        <div class="wd-method-tabs" role="tablist" aria-label="Account type">
          <button
            type="button"
            :class="{ active: accountMethod === 'bank' }"
            role="tab"
            :aria-selected="accountMethod === 'bank'"
            @click="accountMethod = 'bank'"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" />
            </svg>
            Bank Account
          </button>
          <button
            type="button"
            :class="{ active: accountMethod === 'crypto' }"
            role="tab"
            :aria-selected="accountMethod === 'crypto'"
            @click="accountMethod = 'crypto'"
          >
            <span class="wd-coin-mark" aria-hidden="true">B</span>
            Crypto Wallet
          </button>
        </div>

        <template v-if="accountMethod === 'bank'">
          <h2 class="ap-section-h"><span class="ap-mark"></span>Registered Withdrawal Accounts <span class="wd-count">({{ bankAccounts.length }}/5)</span></h2>
          <div v-for="account in bankAccounts" :key="account.number" class="wd-account-card">
            <div class="wd-bank-logo" aria-hidden="true">SH</div>
            <div class="wd-account-copy">
              <strong>{{ account.bank }}</strong>
              <span>{{ account.number }}</span>
              <span>{{ account.date }}</span>
            </div>
          </div>

          <div class="wd-form-grid wd-management-form">
            <label for="wd-manage-bank">Select Bank:</label>
            <select id="wd-manage-bank" v-model="managementBank" class="ap-input">
              <option value="" disabled>Please Select a Bank</option>
              <option v-for="bank in banks" :key="bank" :value="bank">{{ bank }}</option>
            </select>
            <label for="wd-name-card">Name on Card:</label>
            <input id="wd-name-card" class="ap-input" value="T***" disabled />
            <label for="wd-account-number">Account Number:</label>
            <input id="wd-account-number" v-model="managementAccount" class="ap-input" inputmode="numeric" placeholder="Please enter account/card/phone number" />
            <label for="wd-management-password">Transaction Password:</label>
            <input id="wd-management-password" v-model="managementPassword" class="ap-input" type="password" placeholder="Please fill in the transaction password" />
          </div>
          <button class="ap-btn-wide ap-grad" :disabled="!bankManagementReady" @click="registerBank">Submit</button>
        </template>

        <template v-else>
          <h2 class="ap-section-h"><span class="ap-mark"></span>Registered Crypto Wallets <span class="wd-count">({{ cryptoWallets.length }}/5)</span></h2>
          <div v-if="!cryptoWallets.length" class="wd-compact-empty">
            <span class="wd-empty-symbol" aria-hidden="true">B</span>
            <span>No registered crypto wallet</span>
          </div>
          <div v-for="wallet in cryptoWallets" :key="wallet.address" class="wd-account-card">
            <span class="wd-wallet-logo" aria-hidden="true">{{ wallet.type.slice(0, 1) }}</span>
            <div class="wd-account-copy">
              <strong>{{ wallet.type }}</strong>
              <span>{{ wallet.address }}</span>
              <span>{{ wallet.date }}</span>
            </div>
          </div>

          <div class="wd-form-grid wd-management-form">
            <label for="wd-manage-wallet-type">Wallet Type:</label>
            <select id="wd-manage-wallet-type" v-model="managementWalletType" class="ap-input">
              <option value="" disabled>Please select wallet type</option>
              <option value="USDT-TRC20">USDT-TRC20</option>
              <option value="USDT-ERC20">USDT-ERC20</option>
              <option value="BTC">BTC</option>
            </select>
            <label for="wd-manage-wallet-address">Wallet Address:</label>
            <input id="wd-manage-wallet-address" v-model="managementWalletAddress" class="ap-input" placeholder="Please fill in wallet address" />
            <label for="wd-manage-wallet-password">Transaction Password:</label>
            <input id="wd-manage-wallet-password" v-model="managementWalletPassword" class="ap-input" type="password" placeholder="Please fill in the transaction password" />
          </div>
          <button class="ap-btn-wide ap-grad" :disabled="!cryptoManagementReady" @click="registerWallet">Submit</button>
        </template>
      </div>
    </template>

    <div v-if="dialog" class="modal-bg" @click="dialog = null">
      <div class="pi-success" @click.stop>
        <div class="pi-success-check" :class="{ warn: dialog.type === 'warning' }">
          <svg v-if="dialog.type === 'success'" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>
          <svg v-else width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4 2.5 20h19L12 4Z" /><path d="M12 10v4.5M12 17.5h.01" /></svg>
        </div>
        <div class="pi-success-title">{{ dialog.title }}</div>
        <div class="pi-success-sub">{{ dialog.message }}</div>
        <button class="ap-btn-wide ap-grad" @click="dialog = null">Got It</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';

defineProps({
  user: { type: Object, default: null },
});

const emit = defineEmits(['navigate']);

const primaryTabs = [
  { id: 'withdraw', label: 'Withdraw' },
  { id: 'management', label: 'Account Management' },
];
const banks = ['Shinhan Bank', 'KB Bank', 'Woori Bank', 'Hana Bank', 'NH Bank'];

const primaryTab = ref('withdraw');
const withdrawMethod = ref('crypto');
const accountMethod = ref('bank');
const dialog = ref(null);

const bankAmount = ref('');
const bankPassword = ref('');
const walletType = ref('');
const walletAddress = ref('');
const cryptoAmount = ref('');
const cryptoPassword = ref('');

const managementBank = ref('');
const managementAccount = ref('');
const managementPassword = ref('');
const managementWalletType = ref('');
const managementWalletAddress = ref('');
const managementWalletPassword = ref('');

const bankAccounts = ref([
  { bank: 'Shinhan Bank', number: '********5123', date: '2025-01-08 21:22:25' },
]);
const cryptoWallets = ref([]);

const hasAmount = (value) => Number(String(value).replace(/[^\d]/g, '')) > 0;
const bankWithdrawReady = computed(() => hasAmount(bankAmount.value) && bankPassword.value.trim());
const cryptoWithdrawReady = computed(() =>
  walletType.value && walletAddress.value.trim() && hasAmount(cryptoAmount.value) && cryptoPassword.value.trim()
);
const bankManagementReady = computed(() =>
  managementBank.value && managementAccount.value.trim() && managementPassword.value.trim()
);
const cryptoManagementReady = computed(() =>
  managementWalletType.value && managementWalletAddress.value.trim() && managementWalletPassword.value.trim()
);

function openCryptoManagement() {
  primaryTab.value = 'management';
  accountMethod.value = 'crypto';
}

function submitWithdrawal(method) {
  dialog.value = {
    type: 'success',
    title: 'Success!',
    message: `${method} withdrawal request submitted successfully.`,
  };
}

function registerBank() {
  if (bankAccounts.value.length >= 5) {
    dialog.value = { type: 'warning', title: 'Account Limit', message: 'A maximum of five withdrawal accounts can be registered.' };
    return;
  }
  const last4 = managementAccount.value.replace(/\D/g, '').slice(-4) || managementAccount.value.slice(-4);
  bankAccounts.value.push({
    bank: managementBank.value,
    number: `********${last4}`,
    date: new Date().toISOString().slice(0, 19).replace('T', ' '),
  });
  managementAccount.value = '';
  managementPassword.value = '';
  dialog.value = { type: 'success', title: 'Success!', message: 'Withdrawal account registered successfully.' };
}

function registerWallet() {
  if (cryptoWallets.value.length >= 5) {
    dialog.value = { type: 'warning', title: 'Wallet Limit', message: 'A maximum of five crypto wallets can be registered.' };
    return;
  }
  const address = managementWalletAddress.value.trim();
  cryptoWallets.value.push({
    type: managementWalletType.value,
    address: `${address.slice(0, 8)}...${address.slice(-6)}`,
    date: new Date().toISOString().slice(0, 19).replace('T', ' '),
  });
  managementWalletAddress.value = '';
  managementWalletPassword.value = '';
  dialog.value = { type: 'success', title: 'Success!', message: 'Crypto wallet registered successfully.' };
}
</script>
