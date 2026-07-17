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

  <!-- Step 3: QR relay (all methods except Bank Card) -->
  <section v-else-if="step === 3" class="lobby-section ap-page" data-screen-label="Deposit">
    <button class="ap-back" @click="step = 1">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 6-6 6 6 6" /></svg>
      Back
    </button>
    <h1 class="ap-h1">Deposit</h1>

    <div class="dp-steps" role="list" :aria-label="t('deposit.qr.heading')">
      <div
        v-for="(label, i) in stepLabels" :key="i"
        class="dp-step"
        :class="{ active: i === currentStepIndex, done: i < currentStepIndex }"
        role="listitem"
      >
        <span class="dp-step-num">{{ i + 1 }}</span>
        <span class="dp-step-label">{{ label }}</span>
      </div>
    </div>

    <div class="ap-transfer">
      <div class="ap-transfer-pill">{{ t('deposit.qr.heading') }}</div>
      <div class="ap-form-card">
        <div class="ap-transfer-amt-row">
          <span class="ap-transfer-label">{{ t('deposit.qr.amountLabel') }}</span>
          <span class="ap-transfer-amt">{{ qrAmountDisplay }}</span>
        </div>

        <div class="dp-qr-wrap">
          <svg class="dp-qr-svg" viewBox="0 0 21 21" role="img" :aria-label="t('deposit.qr.heading')">
            <rect x="0" y="0" width="21" height="21" fill="#fff" />
            <rect v-for="(m, idx) in QR_MODULES" :key="idx" :x="m.col" :y="m.row" width="1" height="1" fill="#0b0b10" />
            <g v-for="(pos, i) in QR_FINDER_POSITIONS" :key="'finder-' + i">
              <rect :x="pos.x" :y="pos.y" width="7" height="7" fill="#0b0b10" />
              <rect :x="pos.x + 1" :y="pos.y + 1" width="5" height="5" fill="#fff" />
              <rect :x="pos.x + 2" :y="pos.y + 2" width="3" height="3" fill="#0b0b10" />
            </g>
          </svg>
        </div>

        <p class="ap-transfer-note">{{ paymentTarget.type === 'url' ? t('deposit.qr.urlHint') : t('deposit.qr.walletHint') }}</p>

        <div class="dp-qr-target">
          <span class="dp-qr-target-label">{{ paymentTarget.type === 'url' ? t('deposit.qr.urlLabel') : t('deposit.qr.walletLabel') }}</span>
          <div class="dp-qr-target-row">
            <code class="dp-qr-target-value">{{ paymentTarget.value }}</code>
            <button type="button" class="dp-qr-copy" :class="{ copied }" @click="copyPaymentTarget">
              {{ copied ? t('deposit.qr.copied') : t('deposit.qr.copy') }}
            </button>
          </div>
        </div>

        <button class="ap-btn-wide ap-grad" @click="finishQrStep">{{ t('deposit.qr.complete') }}</button>
        <button class="ap-btn-wide outline" @click="step = 1">{{ t('deposit.qr.back') }}</button>
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

    <div v-if="method !== 'bank'" class="dp-steps" role="list" :aria-label="t('deposit.qr.heading')">
      <div
        v-for="(label, i) in stepLabels" :key="i"
        class="dp-step"
        :class="{ active: i === currentStepIndex, done: i < currentStepIndex }"
        role="listitem"
      >
        <span class="dp-step-num">{{ i + 1 }}</span>
        <span class="dp-step-label">{{ label }}</span>
      </div>
    </div>

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
          {{ applicationResult.type === 'success' ? 'Continue' : 'Got It' }}
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
import { useLocale } from '@/composables/useLocale.js';

const { t } = useLocale();
const emit = defineEmits(['navigate']);

// Deterministic decorative QR pattern (not a real encoding) — fixed 21x21 grid
// with three finder-pattern corners, shared by every non-bank method.
const QR_SIZE = 21;
const QR_FINDER_SIZE = 7;
const QR_FINDER_POSITIONS = [
  { x: 0, y: 0 },
  { x: QR_SIZE - QR_FINDER_SIZE, y: 0 },
  { x: 0, y: QR_SIZE - QR_FINDER_SIZE },
];
function isQrFinderZone(row, col) {
  return QR_FINDER_POSITIONS.some(
    (pos) => row >= pos.y && row < pos.y + QR_FINDER_SIZE && col >= pos.x && col < pos.x + QR_FINDER_SIZE
  );
}
const QR_MODULES = [];
for (let row = 0; row < QR_SIZE; row++) {
  for (let col = 0; col < QR_SIZE; col++) {
    if (isQrFinderZone(row, col)) continue;
    if ((row * 31 + col * 17 + row * col * 7) % 11 < 5) QR_MODULES.push({ row, col });
  }
}

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

// QR relay step — every method except Bank Card routes through a QR + payment
// link screen before returning to the account (Bank Card keeps its own step 2).
const stepLabels = computed(() => [t('deposit.steps.method'), t('deposit.steps.qr')]);
const currentStepIndex = computed(() => (step.value === 3 ? 1 : 0));

const paymentTargets = {
  linepay: { type: 'url', value: 'https://line.example/pay/dep-8f42a1c9' },
  'usdt-trc20': { type: 'address', value: 'TQn9Y2khEsLMj6f8Jm3vBd7hNq4xRzP1sK' },
  'usdt-erc20': { type: 'address', value: 'TXk7Bp2wRq9LmZ4vGd6sYcN3hEaJ8fVoQ1' },
};
const paymentTarget = computed(() => paymentTargets[method.value] || paymentTargets.linepay);
const qrAmountDisplay = computed(() => (isCrypto.value ? `${converted.value} USDT` : `₩ ${custom.value || '0'}`));

const copied = ref(false);
let copyTimer = null;
async function copyPaymentTarget() {
  const value = paymentTarget.value.value;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      const el = document.createElement('textarea');
      el.value = value;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
  } catch {
    // Clipboard access unavailable — UI still confirms the intent below.
  }
  copied.value = true;
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => { copied.value = false; }, 1600);
}

function pick(n) {
  amount.value = n;
  custom.value = n.toLocaleString();
}

function submitApplication() {
  if (method.value !== 'bank') {
    step.value = 3;
    return;
  }
  applicationResult.value = applicationMessages[provider.value];
}

function finishQrStep() {
  applicationResult.value = applicationMessages[provider.value];
}

function closeApplicationResult() {
  const success = applicationResult.value?.type === 'success';
  const selectedMethod = method.value;
  applicationResult.value = null;
  if (!success) return;
  if (selectedMethod === 'bank') {
    step.value = 2;
    return;
  }
  step.value = 1;
  emit('navigate', 'Account Overview');
}
</script>
