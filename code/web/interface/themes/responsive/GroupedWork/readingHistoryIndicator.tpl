{if !empty($inReadingHistory)}
	{if empty($isSearchResults)}<div class="row">{/if}
		<div class="result-label col-sm-4 col-xs-12">{translate text='Last Checkout' isPublicFacing=true} </div>
		<div class="result-value col-sm-8 col-xs-12">
			<span class="readingHistoryIndicator badge">{$lastCheckedOut|date_format:"%b %Y"}</span>
		</div>
	{if empty($isSearchResults)}</div>{/if}
{/if}