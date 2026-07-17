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

    <div class="ui-tablist--underline" role="tablist" aria-label="Payment gateway provider">
      <button
        v-for="option in providers"
        :key="option.id"
        type="button"
        class="ui-tab--underline"
        :class="{ active: provider === option.id }"
        role="tab"
        :aria-selected="provider === option.id"
        :tabindex="provider === option.id ? 0 : -1"
        @click="provider = option.id"
      >
        <span class="dp-provider-code">{{ option.id.toUpperCase() }}</span>
        <span>{{ option.label }}</span>
      </button>
    </div>

    <div class="dp-method-tabs">
      <button
        v-for="option in availableMethods"
        :key="option.id"
        type="button"
        :class="{ active: method === option.id }"
        @click="method = option.id"
      >
        <svg v-if="option.id === 'bank'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /></svg>
        <svg v-else-if="option.id === 'linepay'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" /></svg>
        <span v-else class="dp-method-coin">₮</span>
        <span>{{ option.label }}</span>
      </button>
    </div>

    <!-- Bank Card / LinePay -->
    <div v-if="!isCrypto" class="ap-form-card">
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

      <button class="ap-btn-wide ap-grad" :disabled="!promo" @click="submitApplication">Apply for Deposit</button>
      <button class="ap-btn-wide outline" @click="emit('navigate', 'Account Overview')">Back</button>
    </div>

    <!-- USDT -->
    <div v-else class="ap-form-card">
      <h3 class="ap-section-h"><span class="ap-mark"></span>Deposit Info</h3>
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

      <button class="ap-btn-wide ap-grad" :disabled="!cryptoReady" @click="submitApplication">Apply for Deposit</button>
      <button class="ap-btn-wide outline" @click="emit('navigate', 'Account Overview')">Back</button>
    </div>

    <div v-if="applicationResult" class="modal-bg" @click="closeApplicationResult">
      <div class="pi-success deposit-result" @click.stop>
        <div class="pi-success-check" :class="{ warn: applicationResult.type !== 'success' }">
          <svg v-if="applicationResult.type === 'success'" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10" /></svg>
          <svg v-else width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M12 7v6M12 17h.01" /></svg>
        </div>
        <div class="pi-success-title">{{ applicationResult.title }}</div>
        <div v-if="applicationResult.message" class="pi-success-sub">{{ applicationResult.message }}</div>
        <button class="ap-btn-wide ap-grad" @click="closeApplicationResult">
          {{ applicationResult.type === 'success' && method === 'bank' ? 'Continue' : 'Got It' }}
        </button>
        <button
          v-if="applicationResult.type !== 'success'"
          class="ap-btn-wide outline"
          @click="emit('navigate', 'Customer Service')"
        >Contact Customer Support</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const emit = defineEmits(['navigate']);

const presets = [10000, 50000, 100000, 500000, 1000000];
const amount  = ref(10000);
const custom  = ref('10,000');
const promo   = ref(null);
const step    = ref(1);
const method  = ref('bank');
const provider = ref('a');
const applicationResult = ref(null);

const providers = [
  { id: 'a', label: 'Provider A', methodCount: 4 },
  { id: 'b', label: 'Provider B', methodCount: 3 },
  { id: 'c', label: 'Provider C', methodCount: 2 },
  { id: 'd', label: 'Provider D', methodCount: 1 },
];
const paymentMethods = [
  { id: 'bank', label: 'Bank Card' },
  { id: 'linepay', label: 'LinePay' },
  { id: 'usdt-trc20', label: 'USDT-TRC20' },
  { id: 'usdt-erc20', label: 'USDT-ERC20' },
];
const applicationMessages = {
  a: { type: 'success', title: 'Success!', message: '' },
  b: { type: 'warning', title: 'Application Notice', message: 'The maximum number of application attempts has been reached. Please contact customer support for assistance.' },
  c: { type: 'warning', title: 'Application Notice', message: 'Your application has been temporarily suspended due to too many failed transaction attempts. Please contact customer support for assistance.' },
  d: { type: 'warning', title: 'Application Notice', message: 'The requested amount has reached the maximum limit. Please contact customer support for assistance.' },
};

const activeProvider = computed(() => providers.find((option) => option.id === provider.value) || providers[0]);
const availableMethods = computed(() => paymentMethods.slice(0, activeProvider.value.methodCount));
const isCrypto = computed(() => method.value.startsWith('usdt-'));

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

watch(availableMethods, (methods) => {
  if (!methods.some((option) => option.id === method.value)) method.value = methods[0].id;
});

function pick(n) {
  amount.value = n;
  custom.value = n.toLocaleString();
}

function submitApplication() {
  applicationResult.value = applicationMessages[provider.value];
}

function closeApplicationResult() {
  const continueToTransfer = applicationResult.value?.type === 'success' && method.value === 'bank';
  applicationResult.value = null;
  if (continueToTransfer) step.value = 2;
}
</script>
