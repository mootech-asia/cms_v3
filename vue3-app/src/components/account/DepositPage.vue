<template>
  <!-- Step 2: Transfer details -->
  <section v-if="step === 2" class="lobby-section ap-page" data-screen-label="Deposit">
    <button class="ap-back" @click="step = 1">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 6-6 6 6 6" /></svg>
      Back
    </button>
    <h1 class="ap-h1">Deposit</h1>
    <div class="ap-transfer">
      <div class="ap-transfer-pill">Transfer Details</div>
      <div class="ap-form-card">
        <div class="ap-transfer-amt-row">
          <span class="ap-transfer-label">Deposit Amount</span>
          <span class="ap-transfer-amt">₩ {{ custom || '0' }}</span>
        </div>
        <div class="ap-transfer-acc-row">
          <span class="ap-transfer-label">Deposit Account</span>
          <span class="ap-transfer-acc">wururu1234</span>
        </div>
        <p class="ap-transfer-note">
          Once the transfer is complete, please click the "Complete Deposit" button below.
          Should you have any questions, please feel free to contact our Customer Service team.
        </p>
        <a href="#" class="ap-transfer-cs" @click.prevent="emit('navigate', 'Customer Service')">Customer Service</a>
        <button class="ap-btn-wide ap-grad" @click="step = 1; emit('navigate', 'Account Overview')">Complete</button>
        <button class="ap-btn-wide outline" @click="step = 1">Back</button>
      </div>
    </div>
  </section>

  <!-- Step 1: Method tabs + form -->
  <section v-else class="lobby-section ap-page" data-screen-label="Deposit">
    <button class="ap-back" @click="emit('navigate', 'Account Overview')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 6-6 6 6 6" /></svg>
      Back
    </button>
    <h1 class="ap-h1">Deposit</h1>

    <div class="dp-method-tabs">
      <button :class="{ active: method === 'bank' }" @click="method = 'bank'">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /></svg>
        <span>Bank Card</span>
      </button>
      <button :class="{ active: method === 'crypto' }" @click="method = 'crypto'">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"><circle cx="12" cy="12" r="9" /><path d="M9.5 8h4a2.2 2.2 0 0 1 0 4.4h-4Zm0 4.4h4.3a2.2 2.2 0 0 1 0 4.4H9.5Zm.5-6.4v12M13 6v2M13 16v2" /></svg>
        <span>Crypto Wallet</span>
      </button>
    </div>

    <!-- Bank Card -->
    <div v-if="method === 'bank'" class="ap-form-card">
      <h3 class="ap-section-h"><span class="ap-mark"></span>Deposit Amount</h3>
      <div class="ap-amount-grid">
        <button
          v-for="n in presets" :key="n"
          class="ap-amount-btn"
          :class="{ active: amount === n }"
          @click="pick(n)"
        >{{ n.toLocaleString() }}</button>
      </div>
      <input class="ap-input" :value="'₩ ' + custom"
        @input="custom = $event.target.value.replace(/[^\d,]/g, '')" />
      <p class="ap-error">* Minimum Amount: ₩ 10,000; Maximum Amount: ₩ 9,000,000 *</p>

      <h3 class="ap-section-h"><span class="ap-mark"></span>Choose promotion</h3>
      <div class="ap-promo-list">
        <label class="ap-promo-card" :class="{ active: promo === 'a' }">
          <input type="radio" name="promo" :checked="promo === 'a'" @change="promo = 'a'" />
          <span class="ap-radio"></span>
          <div>
            <div class="ap-promo-title">New Sign-up First Deposit 50%</div>
            <ul class="ap-promo-bullets">
              <li>Note: This event is not applicable to Evolution Gaming and Pragmatic Play casino games.</li>
              <li>Rollover Requirement: The rollover for all funds is calculated as 300% of (Deposit Amount + Bonus).</li>
              <li>Bets with odds less than 1.7 will not count towards the rollover requirement.</li>
            </ul>
          </div>
        </label>
        <label class="ap-promo-card" :class="{ active: promo === 'b' }">
          <input type="radio" name="promo" :checked="promo === 'b'" @change="promo = 'b'" />
          <span class="ap-radio"></span>
          <div>
            <div class="ap-promo-title">Exclusive to Evolution Gaming, Pragmatic Play Casinos Unlimited Deposit…</div>
            <ul class="ap-promo-bullets">
              <li>The rollover for all funds is (Deposit Amount + Bonus) multiplied by</li>
              <li>Maximum Bonus Amount: ₩200,000.</li>
              <li>Withdrawal Rollover Condition: 10 times (1,000%).</li>
              <li>Example: Deposit ₩1,000,000, receive a ₩200,000 bonus.</li>
              <li>(1,000,000 + 200,000) × 10 = 12,000,000</li>
            </ul>
          </div>
        </label>
      </div>

      <button class="ap-btn-wide ap-grad" :disabled="!promo" @click="step = 2">Next</button>
      <button class="ap-btn-wide outline" @click="emit('navigate', 'Account Overview')">Back</button>
    </div>

    <!-- Crypto Wallet -->
    <div v-else class="ap-form-card">
      <h3 class="ap-section-h"><span class="ap-mark"></span>Deposit Info</h3>
      <div class="dp-crypto-method">
        <span class="dp-usdt">₮</span> USDT TRC20
      </div>
      <div class="dp-crypto-grid">
        <label>Deposit Amounts:</label>
        <div>
          <input class="ap-input" v-model="cryptoAmount" inputmode="numeric" placeholder="Deposit Amounts" />
          <p class="ap-error">Deposit Limit: ₩ 50,000 (32.96 USDT) - ₩ 8,999,999 (5,932.83 USDT)</p>
        </div>
        <label>Converted Crypto Amount:</label>
        <div class="dp-converted">
          <input class="ap-input" :value="converted" disabled />
          <strong>USDT</strong>
        </div>
      </div>
      <p class="dp-rate">Exchange rate: <strong>1 USDT = ₩ 1,516.98</strong></p>

      <h3 class="ap-section-h"><span class="ap-mark"></span>Choose promotion</h3>
      <button
        v-for="(p, i) in cryptoPromos" :key="p"
        class="ap-promo-card dp-crypto-promo"
        :class="{ active: cryptoPromo === i }"
        @click="cryptoPromo = i"
      >
        <span class="ap-radio"></span>
        <strong class="dp-crypto-title">{{ p }}</strong>
        <span class="dp-crypto-amt">≥₩ 10,000.00</span>
      </button>

      <button class="ap-btn-wide ap-grad" :disabled="!cryptoReady" @click="emit('navigate', 'Account Overview')">Apply for Deposit</button>
      <button class="ap-btn-wide outline" @click="emit('navigate', 'Account Overview')">Back</button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['navigate']);

const presets = [10000, 50000, 100000, 500000, 1000000];
const amount  = ref(10000);
const custom  = ref('10,000');
const promo   = ref(null);
const step    = ref(1);
const method  = ref('bank');

const cryptoAmount = ref('');
const cryptoPromo  = ref(null);
const cryptoPromos = [
  '[USDT only] Slot Daily First Deposit 5%',
  '[USDT only] Casino Reload 5%',
  '[USDT only] Slot Reload 5%',
];

const converted = computed(() => {
  const v = Number(String(cryptoAmount.value).replace(/[^\d]/g, ''));
  return v > 0 ? (v / 1516.98).toFixed(2) : '0.00';
});
const cryptoReady = computed(() =>
  Number(String(cryptoAmount.value).replace(/[^\d]/g, '')) > 0 && cryptoPromo.value !== null
);

function pick(n) {
  amount.value = n;
  custom.value = n.toLocaleString();
}
</script>
