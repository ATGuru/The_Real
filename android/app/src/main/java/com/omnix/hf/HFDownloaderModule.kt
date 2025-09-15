package com.omnix.hf

import android.app.DownloadManager
import android.content.Context
import android.database.Cursor
import android.net.Uri
import android.os.Environment
import com.facebook.react.bridge.*

class HFDownloaderModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "HFDownloader"

  @ReactMethod
  fun enqueue(url: String, filename: String, promise: Promise) {
    try {
      val dm = reactContext.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
      val request = DownloadManager.Request(Uri.parse(url))
        .setTitle(filename)
        .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
        .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename)
        .setAllowedOverMetered(true)
        .setAllowedOverRoaming(true)
      val id = dm.enqueue(request)
      promise.resolve(id.toDouble())
    } catch (e: Exception) {
      promise.reject("E_ENQUEUE", e)
    }
  }

  @ReactMethod
  fun cancel(id: Double, promise: Promise) {
    try {
      val dm = reactContext.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
      dm.remove(id.toLong())
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("E_CANCEL", e)
    }
  }

  @ReactMethod
  fun query(id: Double, promise: Promise) {
    val result = Arguments.createMap()
    try {
      val dm = reactContext.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
      val q = DownloadManager.Query().setFilterById(id.toLong())
      val cursor: Cursor = dm.query(q)
      if (cursor.moveToFirst()) {
        val statusIdx = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS)
        val titleIdx = cursor.getColumnIndex(DownloadManager.COLUMN_TITLE)
        val totalIdx = cursor.getColumnIndex(DownloadManager.COLUMN_TOTAL_SIZE_BYTES)
        val soFarIdx = cursor.getColumnIndex(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR)
        val localUriIdx = cursor.getColumnIndex(DownloadManager.COLUMN_LOCAL_URI)
        val status = if (statusIdx >= 0) cursor.getInt(statusIdx) else -1
        val title = if (titleIdx >= 0) cursor.getString(titleIdx) else null
        val total = if (totalIdx >= 0) cursor.getLong(totalIdx) else -1L
        val soFar = if (soFarIdx >= 0) cursor.getLong(soFarIdx) else -1L
        val localUri = if (localUriIdx >= 0) cursor.getString(localUriIdx) else null
        result.putInt("status", status)
        result.putString("title", title)
        result.putDouble("totalBytes", total.toDouble())
        result.putDouble("downloadedBytes", soFar.toDouble())
        result.putString("localUri", localUri)
      }
      cursor.close()
      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("E_QUERY", e)
    }
  }
}

