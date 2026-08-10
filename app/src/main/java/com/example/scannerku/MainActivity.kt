package com.example.scannerku

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import com.journeyapps.barcodescanner.CaptureActivity
import com.journeyapps.barcodescanner.ScanContract
import com.journeyapps.barcodescanner.ScanOptions
import okhttp3.*
import java.io.IOException

class MainActivity : AppCompatActivity() {

    private lateinit var scanResultTv: TextView
    private lateinit var scanBtn: Button
    private lateinit var dashboardBtn: Button
    private lateinit var openSheetBtn: Button
    private val GAS_URL = "ADD_SCRIPT_URL_"
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)

        scanResultTv = findViewById(R.id.scanResultTv)
        scanBtn = findViewById(R.id.scanBtn)
        dashboardBtn = findViewById(R.id.dashboardBtn)
        openSheetBtn = findViewById(R.id.openSheetBtn)

        // 1. Logika Tombol Scan
        scanBtn.setOnClickListener {
            val options = ScanOptions()
            options.setPrompt("")
            options.setBeepEnabled(true)
            options.setOrientationLocked(true)
            options.setCaptureActivity(CustomCaptureActivity::class.java)
            barcodeLauncher.launch(options)
        }

        // 2. Logika Tombol Lihat Rekap (Pindah Halaman Manual)
        dashboardBtn.setOnClickListener {
            val intent = Intent(this@MainActivity, DashboardActivity::class.java)
            startActivity(intent)
        }

        // 3. Logika Tombol Buka Google Sheets
        openSheetBtn.setOnClickListener {
            val url = "ADD_LINK_FOR_SHEETS"
            val intent = Intent(Intent.ACTION_VIEW)
            intent.data = android.net.Uri.parse(url)
            startActivity(intent)
        }
    }

    private val barcodeLauncher = registerForActivityResult(ScanContract()) { result ->
        if (result.contents != null) {
            val nisn = result.contents
            if (nisn.isNotEmpty()) {
                kirimDataKeGoogleSheets(nisn)
            } else {
                Toast.makeText(this, "Data QR Kosong", Toast.LENGTH_SHORT).show()
            }
        } else {
            Toast.makeText(this, "Scan Dibatalkan", Toast.LENGTH_SHORT).show()
        }
    }

    private fun kirimDataKeGoogleSheets(nisn: String) {
        scanResultTv.text = "⏳ Mengirim NISN $nisn ke server..."

        val client = OkHttpClient()
        val formBody = FormBody.Builder()
            .add("nisn", nisn)
            .build()

        val request = Request.Builder()
            .url(GAS_URL)
            .post(formBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    scanResultTv.text = "❌ Gagal Terhubung:\n${e.message}"
                }
            }

            override fun onResponse(call: Call, response: Response) {
                // 1. Tangkap pesan balasan dari Google Script
                val serverReply = response.body?.string() ?: "Tidak ada balasan"

                runOnUiThread {
                    if (response.isSuccessful) {
                        // 2. Tampilkan pesan dari server (bisa pesan Berhasil atau Gagal/Ganda)
                        scanResultTv.text = serverReply
                    } else {
                        scanResultTv.text = "❌ Error Server: ${response.code}"
                    }
                }
            }
        })
    }
}